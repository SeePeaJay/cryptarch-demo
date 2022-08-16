const Lexer = require('./lexer');
const { TOKENS, TREE_NODE_TYPES } = require('./constants');

class Parser {
	constructor() {
		this.lexer = new Lexer();
		this.lookahead = null;
	}

	parse(engram) {
		this.lexer.scan(engram);
		this.lookahead = this.lexer.getNextToken();
		const tree = this.getEngramNode();
		return tree;
	}

	getEngramNode() {
		return {
			type: TREE_NODE_TYPES.engram,
			rootBlockNodes: this.getRootBlockNodes(),
		};
	}

	getRootBlockNodes() {
		const rootBlockNodes = [];

		while (this.lookahead) {
			switch (this.lookahead.type) {
				case TOKENS.titleMarker.type:
					rootBlockNodes.push(this.getTitleNode());
					break;
				case TOKENS.level1SubtitleMarker.type:
					rootBlockNodes.push(this.getLevel1SubtitleNode());
					break;
				case TOKENS.level2SubtitleMarker.type:
					rootBlockNodes.push(this.getLevel2SubtitleNode());
					break;
				case TOKENS.level3SubtitleMarker.type:
					rootBlockNodes.push(this.getLevel3SubtitleNode());
					break;
				case TOKENS.unorderedListMarker.type:
					rootBlockNodes.push(this.getUnorderedListNode(0));
					break;
				case TOKENS.orderedListMarker.type:
					rootBlockNodes.push(this.getOrderedListNode(0));
					break;
				case TOKENS.horizontalRule.type:
					rootBlockNodes.push(this.getHorizontalRuleNode());
					break;
				case TOKENS.leftImageMarker.type:
					rootBlockNodes.push(this.getImageNode());
					break;
				case TOKENS.rootBlockSeparator.type:
					this.eat(TOKENS.rootBlockSeparator);
					break;
				default: // should be a paragraph at this point
					rootBlockNodes.push(this.getParagraphNode());
			}
		}

		return rootBlockNodes;
	}

	getTitleNode() {
		this.eat(TOKENS.titleMarker);
		return {
			type: TREE_NODE_TYPES.title,
			textNodes: this.getTextNodes(),
		};
	}

	getLevel1SubtitleNode() {
		this.eat(TOKENS.level1SubtitleMarker);
		return {
			type: TREE_NODE_TYPES.level1Subtitle,
			textNodes: this.getTextNodes(),
		};
	}

	getLevel2SubtitleNode() {
		this.eat(TOKENS.level2SubtitleMarker);
		return {
			type: TREE_NODE_TYPES.level2Subtitle,
			textNodes: this.getTextNodes(),
		};
	}

	getLevel3SubtitleNode() {
		this.eat(TOKENS.level3SubtitleMarker);
		return {
			type: TREE_NODE_TYPES.level3Subtitle,
			textNodes: this.getTextNodes(),
		};
	}

	getUnorderedListNode(currentIndentLevel) {
		return {
			type: TREE_NODE_TYPES.unorderedList,
			listItemNodes: this.getUnorderedListItemNodes(currentIndentLevel),
		};
	}

	getUnorderedListItemNodes(currentIndentLevel) {
		const unorderedListItemNodes = [];

		unorderedListItemNodes.push(this.getUnorderedListItemNode(currentIndentLevel)); // unordered list should have at least one list item
		while (this.lookahead && this.lookahead.type !== TOKENS.rootBlockSeparator.type) {
			const nextIndentLevel = this.getNextIndentLevel(this.lookahead);

			if (nextIndentLevel === currentIndentLevel) {
				this.eat(TOKENS.listItemSeparator);
				unorderedListItemNodes.push(this.getUnorderedListItemNode(currentIndentLevel));
			} else {
				break;
			}
		}

		return unorderedListItemNodes;
	}

	getUnorderedListItemNode(currentIndentLevel) {
		this.eat(TOKENS.unorderedListMarker);

		const listItemNode = {
			type: TREE_NODE_TYPES.listItem,
			textNodes: this.getTextNodes(),
		};

		if (this.lookahead && this.lookahead.type === TOKENS.listItemSeparator.type) {
			const nextIndentLevel = this.getNextIndentLevel(this.lookahead);

			if (nextIndentLevel > currentIndentLevel) {
				this.eat(TOKENS.listItemSeparator);

				if (this.lookahead.type === TOKENS.unorderedListMarker.type) {
					listItemNode.listNode = this.getUnorderedListNode(nextIndentLevel);
				} else {
					listItemNode.listNode = this.getOrderedListNode(nextIndentLevel);
				}
			}
		}

		return listItemNode;
	}

	getNextIndentLevel(listItemSeparatorToken) {
		return listItemSeparatorToken.value.substring(1).length;
	}

	getOrderedListNode(currentIndentLevel) {
		return {
			type: TREE_NODE_TYPES.orderedList,
			listItemNodes: this.getOrderedListItemNodes(currentIndentLevel),
		};
	}

	getOrderedListItemNodes(currentIndentLevel) {
		const orderedListItemNodes = [];

		orderedListItemNodes.push(this.getOrderedListItemNode(currentIndentLevel)); // ordered list should have at least one item
		while (this.lookahead && this.lookahead.type !== TOKENS.rootBlockSeparator.type) {
			const nextIndentLevel = this.getNextIndentLevel(this.lookahead);

			if (nextIndentLevel === currentIndentLevel) {
				this.eat(TOKENS.listItemSeparator);
				orderedListItemNodes.push(this.getOrderedListItemNode(currentIndentLevel));
			} else {
				break;
			}
		}

		return orderedListItemNodes;
	}

	getOrderedListItemNode(currentIndentLevel) {
		this.eat(TOKENS.orderedListMarker);

		const listItemNode = {
			type: TREE_NODE_TYPES.listItem,
			textNodes: this.getTextNodes(),
		};

		if (this.lookahead && this.lookahead.type === TOKENS.listItemSeparator.type) {
			const nextIndentLevel = this.getNextIndentLevel(this.lookahead);

			if (nextIndentLevel > currentIndentLevel) {
				this.eat(TOKENS.listItemSeparator);

				if (this.lookahead.type === TOKENS.orderedListMarker.type) {
					listItemNode.listNode = this.getOrderedListNode(nextIndentLevel);
				} else {
					listItemNode.listNode = this.getUnorderedListNode(nextIndentLevel);
				}
			}
		}

		return listItemNode;
	}

	getHorizontalRuleNode() {
		this.eat(TOKENS.horizontalRule);
		return {
			type: TREE_NODE_TYPES.horizontalRule,
		};
	}

	getParagraphNode() {
		return {
			type: TREE_NODE_TYPES.paragraph,
			textNodes: this.getTextNodes(),
		};
	}

	getImageNode() {
		this.eat(TOKENS.leftImageMarker);
		const imageNode = {
			type: TREE_NODE_TYPES.image,
			path: this.eat(TOKENS.imagePath).value,
		};
		this.eat(TOKENS.rightImageMarker);

		return imageNode;
	}

	getTextNodes() {
		const textNodes = [];

		while (this.lookahead && this.lookahead.type !== TOKENS.rootBlockSeparator.type && this.lookahead.type !== TOKENS.listItemSeparator.type && !this.isClosingStyledTextMarker(this.lookahead)) {
			switch (this.lookahead.type) {
				case TOKENS.leftBoldTextMarker.type:
					textNodes.push(this.getBoldTextNode());
					break;
				case TOKENS.leftItalicTextMarker.type:
					textNodes.push(this.getItalicTextNode());
					break;
				case TOKENS.leftUnderlinedTextMarker.type:
					textNodes.push(this.getUnderlinedTextNode());
					break;
				case TOKENS.leftHighlightedTextMarker.type:
					textNodes.push(this.getHighlightedTextNode());
					break;
				case TOKENS.leftStrikethroughTextMarker.type:
					textNodes.push(this.getStrikethroughTextNode());
					break;
				case TOKENS.leftCodeMarker.type:
					textNodes.push(this.getCodeNode());
					break;
				case TOKENS.linkAliasMarker1.type:
					textNodes.push(this.getLinkAliasNode());
					break;
				case TOKENS.autolink.type:
					textNodes.push(this.getAutolinkNode());
					break;
				case TOKENS.leftImageMarker.type:
					textNodes.push(this.getImageNode());
					break;
				default:
					textNodes.push({
						type: TREE_NODE_TYPES.unmarkedText,
						text: this.eat(TOKENS.unmarkedText).value,
					});
			}
		}

		return textNodes;
	}

	isClosingStyledTextMarker(lookahead) {
		const closingStyledTextMarkers = [TOKENS.rightBoldTextMarker, TOKENS.rightItalicTextMarker, TOKENS.rightUnderlinedTextMarker, TOKENS.rightHighlightedTextMarker, TOKENS.rightStrikethroughTextMarker];

		return closingStyledTextMarkers.find((closingMarker) => lookahead.type === closingMarker.type);
	}

	getBoldTextNode() {
		this.eat(TOKENS.leftBoldTextMarker);
		const boldTextNode = {
			type: TREE_NODE_TYPES.boldText,
			textNodes: this.getTextNodes(),
		};
		this.eat(TOKENS.rightBoldTextMarker);

		return boldTextNode;
	}

	getItalicTextNode() {
		this.eat(TOKENS.leftItalicTextMarker);
		const italicTextNode = {
			type: TREE_NODE_TYPES.italicText,
			textNodes: this.getTextNodes(),
		};
		this.eat(TOKENS.rightItalicTextMarker);

		return italicTextNode;
	}

	getUnderlinedTextNode() {
		this.eat(TOKENS.leftUnderlinedTextMarker);
		const underlinedTextNode = {
			type: TREE_NODE_TYPES.underlinedText,
			textNodes: this.getTextNodes(),
		};
		this.eat(TOKENS.rightUnderlinedTextMarker);

		return underlinedTextNode;
	}

	getHighlightedTextNode() {
		this.eat(TOKENS.leftHighlightedTextMarker);
		const underlinedTextNode = {
			type: TREE_NODE_TYPES.highlightedText,
			textNodes: this.getTextNodes(),
		};
		this.eat(TOKENS.rightHighlightedTextMarker);

		return underlinedTextNode;
	}

	getStrikethroughTextNode() {
		this.eat(TOKENS.leftStrikethroughTextMarker);
		const underlinedTextNode = {
			type: TREE_NODE_TYPES.strikethroughText,
			textNodes: this.getTextNodes(),
		};
		this.eat(TOKENS.rightStrikethroughTextMarker);

		return underlinedTextNode;
	}

	getCodeNode() {
		this.eat(TOKENS.leftCodeMarker);
		const codeNode = {
			type: TREE_NODE_TYPES.code,
			body: this.eat(TOKENS.codeBody).value,
		};
		this.eat(TOKENS.rightCodeMarker);

		return codeNode;
	}

	getLinkAliasNode() {
		this.eat(TOKENS.linkAliasMarker1);
		const linkAliasNode = {
			type: TREE_NODE_TYPES.linkAlias,
		};
		linkAliasNode.title = this.eat(TOKENS.linkAliasTitle).value;
		this.eat(TOKENS.linkAliasMarker2);
		linkAliasNode.url = this.eat(TOKENS.linkAliasUrl).value;
		this.eat(TOKENS.linkAliasMarker3);

		return linkAliasNode;
	}

	getAutolinkNode() {
		return {
			type: TREE_NODE_TYPES.autolink,
			url: this.eat(TOKENS.autolink).value,
		};
	}

	eat(token) {
		if (this.lookahead == null) {
			throw new SyntaxError(
				`Unexpected end of input, expected "${token.type}"`,
			);
		}

		if (this.lookahead.type !== token.type) {
			throw new SyntaxError(
				`Unexpected token: "${this.lookahead.type}", expected; "${token.type}"`,
			);
		}

		const consumedToken = this.lookahead;
		this.lookahead = this.lexer.getNextToken();

		return consumedToken;
	}
}

module.exports = Parser;

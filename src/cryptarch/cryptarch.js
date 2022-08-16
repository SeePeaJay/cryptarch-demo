const Parser = require('./parser');
const Generator = require('./generator');

class Cryptarch {
	constructor() {
		this.parser = new Parser();
		this.generator = new Generator();
	}

	decrypt(engram) {
		const tree = this.parser.parse(engram);
		return this.generator.toHtml(tree);
	}

	getParseTree(engram) {
		return this.parser.parse(engram);
	}

	/* ... */

	getBlockCore(blockContents) { // includes both the block marker and the body/text
		const blockMetadata = this.getBlockMetadata(blockContents);

		if (blockMetadata) {
			return blockContents.slice(0, blockContents.indexOf(blockMetadata));
		}

		return blockContents;
	}

	getBlockBody(blockContents) {
		return this.getBlockCore(blockContents).slice(2); // get rid of title marker; have not renamed yet at this line in time
	}

	getBlockMetadata(blockContents) { // both \n and brackets {} are included
		const indexOfBlockMetadata = blockContents.search(/\n{[\S\s]*}/);

		if (indexOfBlockMetadata >= 0) {
			return blockContents.slice(indexOfBlockMetadata);
		}

		return '';
	}

	getFormattedBlockMetadata(blockMetadata) {
		const trimmedMetadataBody = blockMetadata.slice(3, -2).trim();
			// get rid of `\n{ ` and ` }`
			// TODO: ref magic num

		if (trimmedMetadataBody === '') {
			return '\n{}';
		}

		return `\n{ ${trimmedMetadataBody.split(/\s+/).sort(
			(a, b) => (b === '#Starred{}') - (a === '#Starred{}'),
		).join(' ')} }`; // place Starred in front; should be stable given Node > v12.0.0
	}

	getBlockMetadataBody(blockConntents) { // exclude `\n{ ` and ` }` if contents within
		if (!this.getBlockMetadata(blockConntents)) {
			return '';
		}

		return this.getBlockMetadata(blockConntents).slice(3, -2); // TODO: ref magic num
	}

	getEngramTitleFromLink(engramLink) {
		if (engramLink.startsWith('*')) { // get rid of * and {}
			return engramLink.slice(1, -2); // TODO: ref magic num
		}

		if (engramLink.startsWith('#') && engramLink.endsWith('{}')) {
			return engramLink.slice(1, -2);
		}

		return engramLink.slice(1); // get rid of #; TODO: ref magic num
	}
}

module.exports = Cryptarch;

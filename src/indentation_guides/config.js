import { combineConfig, Facet } from '@codemirror/state';

export class IndentationMarkerConfiguration {
    constructor(highlightActiveBlock = true, hideFirstIndent = false) {
        this.highlightActiveBlock = highlightActiveBlock;
        this.hideFirstIndent = hideFirstIndent;
    }
}

export const indentationMarkerConfig = Facet.define({
    combine(configs) {
        return combineConfig(configs, {
            highlightActiveBlock: true,
            hideFirstIndent: false,
        });
    }
});
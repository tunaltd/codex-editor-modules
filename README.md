# codex-editor-modules

[![Greenkeeper badge](https://badges.greenkeeper.io/tunaltd/codex-editor-modules.svg)](https://greenkeeper.io/)

Some modules for editor.js (codex team)

Source folder structure:  

    |-- apps
    |   |-- LoreCard.ts
    |   |-- LoreEditor.ts // copied from another project. Doing Nothing right now.
    |-- fef.metro // Implementation based on metro
        |-- modules // cards implementation
        |-- tools // specified tools
    |-- models
        |-- ModelData.ts
    |-- tools
        |-- CommonUtility.ts
        |-- LoreService.ts
        |-- SVGConstants.ts // icons
    |-- typings // typings for TypeScript

### Explaination
* the prefix `fef` means Front-end framework
* TypeScript generates js file: `./js/lore-editor-codex.editor.js`
* gulp generates minimized js file: `./js/lore-editor-codex.editor.min.js`

### Demo
* Write article with markdown: loggin lore.chuci.info
* View: 

### Editor
The editor lib: [Editor.js](https://github.com/codex-team/editor.js) under [Apache 2.0 License](https://github.com/codex-team/editor.js/blob/master/LICENSE)

### Common
* [Metro](https://github.com/olton/Metro-UI-CSS) under [MIT License](https://github.com/olton/Metro-UI-CSS/blob/master/LICENSE)
* [cytoscape.js](https://github.com/cytoscape/cytoscape.js) under [MIT License](https://github.com/cytoscape/cytoscape.js/blob/unstable/LICENSE)

### [archived]
Cytoscape module:  
* [demo](http://taurenshaman.github.io/editor@codexteam+jsoneditor.html)

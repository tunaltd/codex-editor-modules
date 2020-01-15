/// <reference path="../../apps/LoreCard.ts" />
/// <reference path="./ModuleBase.ts" />

"use strict";

class LoreCard_Mind extends ModuleBase {
    public static cyStyles = [ // the stylesheet for the graph
        {
            selector: "node",
            style: {
                // "width": "20px",
                // "height": "20px",
                "text-wrap": "wrap",
                "text-max-width": "200px",
                // "overlay-padding": "5px",
                // "overlay-opacity": 0,
                // "z-index": 10,
                // "border-width": 2,
                // "border-opacity": 0,
                "background-color": "#acf",
                "border-width": 1,
                "border-color": "#69c"
            }
        },
        {
            selector: "node[title]",
            style: {
                "label": "data(title)"
            }
        },

        {
            selector: "edge", // default edge style
            style: {
                "curve-style": "unbundled-bezier",
                "control-point-distance": 30,
                "control-point-weight": 0.5,
                "opacity": 0.9,
                "overlay-padding": "3px",
                "overlay-opacity": 0,
                "label": "data(title)",
                "font-family": "FreeSet,Arial,sans-serif",
                "font-size": 9,
                "font-weight": "bold",
                "text-background-opacity": 1,
                "text-background-color": "#ffffff",
                "text-background-padding": 3,
                "text-background-shape": "roundrectangle",
                "width": 1,
                "target-arrow-shape": "vee"
            }
        }
    ];

    CyCache = {};

    constructor({ data, config, api }) {
        super("lorecard.mind");
        this.data = {
            data: data.data,
            stretched: data.stretched !== undefined ? data.stretched : false
        };
        this.config = config || {};
        this.api = api;
        this.wrapper = undefined;
        this.settings = [
            {
                name: 'stretched',
                title: 'Stretch',
                icon: SVGConstants.SVG_Arrow_LeftRight
            },
            {
                name: 'navNote',
                title: 'Open Note',
                icon: SVGConstants.SVG_Arrow_Open_Blank
            },
            {
                name: 'navAuthor',
                title: 'Author',
                icon: SVGConstants.SVG_User_Info
            },
            // fullScreen
            // bug 1: when exit, the height of contianer will be stretched to the screen height
            // bug 2: the background color is white in FullScreen. Tried but not work: https://stackoverflow.com/questions/16163089/background-element-goes-black-when-entering-fullscreen-with-html5
             //{
             //    name: 'fullScreen',
             //    title: 'Full Screen',
             //    icon: SVGConstants.SVG_FullScreen
             //}
        ];
    }

    static get toolbox() {
        return {
            title: 'lore:> mind',
            icon: SVGConstants.SVG_Note_Mind
        };
    }

    setupFullScreen(wrapperId) {
        const wrapper = document.getElementById(wrapperId);
        //const width = wrapper.offsetWidth;
        //const height = wrapper.offsetHeight;

        var sfsCtx = this;
        UIHelper.SetupFullScreen(wrapper, sfsCtx.tryRefreshCyAfterResize(wrapperId));//, width, height
    }

    tryRefreshCyAfterResize(wrapperId) {//, width, height
        //const wrapper = document.getElementById(id);
        //wrapper.style.width = width + "px";
        //wrapper.style.height = height + "px";

        var cy = this.CyCache[wrapperId];
        if (cy) {
            cy.zoom(1);
            cy.resize();
            cy.center();
        }
    }

    initCard(ctx, data) {
        //var wrapper = document.getElementById(ctx.wrapperId + "_wrapper");

        // cy core
        //var divCy = document.getElementById(ctx.wrapperId);
        const divCy = document.createElement('div');
        divCy.setAttribute("id", ctx.wrapperId);
        divCy.setAttribute("style", "min-height: 500px; min-width: 500px;");
        divCy.classList.add('w-100');
        divCy.classList.add('h-100');
        divCy.classList.add('border');
        divCy.classList.add('bd-lightGray');

        this.wrapper.innerHTML = '';
        this.wrapper.appendChild(divCy);

        var cy = cytoscape({
            container: divCy, //document.getElementById(elementId), // container to render in
            zoom: 1,
            elements: _.concat(data.nodes, data.edges),
            style: LoreCard_Mind.cyStyles,
            layout: {
                name: "preset"
            }
        });
        ctx.CyCache[ctx.wrapperId] = cy;
        return cy;
    }

    renderSettings() {
        const wrapper = document.createElement('div');

        this.settings.forEach(tune => {
            let button = document.createElement('div');

            // button.classList.add('cdx-settings-button');
            // button.classList.toggle('cdx-settings-button--active', this.data[tune.name]);
            button.classList.add(this.api.styles.settingsButton);
            button.classList.toggle(this.api.styles.settingsButtonActive, this.data[tune.name]);

            button.innerHTML = tune.icon;
            button.setAttribute("title", tune.title);
            wrapper.appendChild(button);

            button.addEventListener('click', () => {
                if (tune.name === "fullScreen") {
                    UIHelper.LaunchFullScreen(this.wrapper);
                } // fullScreen
                else if (tune.name === "navNote") {
                    CommonUtitlity.OpenLink(this.noteLink);
                }
                else if (tune.name === "navAuthor") {
                    CommonUtitlity.OpenLink(this.authorLink);
                }
                else { // stretch
                    this._toggleTune(tune.name);
                    //button.classList.toggle('cdx-settings-button--active');
                    button.classList.toggle(this.api.styles.settingsButtonActive);
                }
            });
        });

        return wrapper;
    }

    render() {
        this.wrapper = document.createElement('div');
        if (this.data && this.data.data) {
            this.dataUri = this.data.data;
            this.prepare();
            return this.wrapper;
        }

        const inputDataUrl = document.createElement('input');
        inputDataUrl.classList.add('w-100');

        this.wrapper.appendChild(inputDataUrl);

        inputDataUrl.placeholder = 'Paste an data URL...';
        inputDataUrl.value = this.data && this.data.data ? this.data.data : "";

        inputDataUrl.addEventListener('paste', (event) => {
            //this._createImage(event.clipboardData.getData('text'));
            this.dataUri = event.clipboardData.getData('text');
            this.prepare();
        });

        inputDataUrl.addEventListener('keyup', (event) => {
            if (event.keyCode === 13) {
                this.dataUri = inputDataUrl.value;
                this.prepare();
            }
        });

        return this.wrapper;
    }

    prepare() {
        if (!this.dataUri) {
            return;
        }

        this.noteLink = LoreService.getUri_NoteLink(this.dataUri);
        this.authorLink = LoreService.getUri_Author_FromNoteLink(this.dataUri);

        //dataUri = "https://raw.githubusercontent.com/taurenshaman/taurenshaman.github.io/master/data/cytoscape-0.json";
        var uriHash = CommonUtitlity.ComputeHash(this.dataUri);
        this.wrapperId = "divLoreMind_" + uriHash;
        //var exists = document.getElementById(divCyId);
        //if (exists) {
        //    return;
        //}

        //console.log("read to get: " + this.dataUri);
        var ctxGetData = this;
        this.loreService.getNoteByURL(this.dataUri, (data) => {
            var cy = ctxGetData.initCard(ctxGetData, data);
        });
    }

    _toggleTune(tune) {
        this.data[tune] = !this.data[tune];
        this._acceptTuneView();
    }

    _acceptTuneView() {
        this.settings.forEach(tune => {
            this.wrapper.classList.toggle(tune.name, !!this.data[tune.name]);
            if (tune.name === 'stretched') {
                this.api.blocks.stretchBlock(this.api.blocks.getCurrentBlockIndex(), !!this.data.stretched);
                this.tryRefreshCyAfterResize(this.wrapperId);
            }
        });
    }

    save(blockContent) {
        //const input = blockContent.querySelector('input');
        // const inputDataUri = blockContent.querySelector('.data_uri');
        // var dataUri = inputDataUri.value;
        this.prepare();

        return Object.assign(this.data, {
            data: this.dataUri
        });
    }

    validate(savedData) {
        if (!savedData.data || !savedData.data.trim() ) {
            return false;
        }
        return true;
    }

}
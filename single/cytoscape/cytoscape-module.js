
const cyStyles = [ // the stylesheet for the graph
    {
        selector: 'node',
        style: {
            // 'width': '20px',
            // 'height': '20px',
            'text-wrap': 'wrap',
            'text-max-width': '200px',
            // "overlay-padding": "5px",
            // "overlay-opacity": 0,
            // "z-index": 10,
            // "border-width": 2,
            // "border-opacity": 0,
            'background-color': '#acf',
            'border-width': 1,
            'border-color': '#69c'
        }
    },
    {
        selector: 'node[title]',
        style: {
            'label': 'data(title)'
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

const cyLayoutOptions = {
    breadthfirst: {
        name: "breadthfirst"
    },
    circle: {
        name: "circle"
    },
    concentric: {
        name: "concentric",
        concentric: function( node ){
            return node.degree();
        },
        levelWidth: function( nodes ){
            return nodes.maxDegree() / 4;
        }
    },
    cose: {
        name: 'cose',
        padding: 100,
        nodeOverlap: 10,
        idealEdgeLength: function (edge) {
            // switch (edge.data().type) {
            //     case 1 :
            //         return 30;
            //     case 2 :
            //     case 3 :
            //         return 120;
            //     case 0 :
            //     default :
            //         return 45;
            // }
            return _.random(40, 130);
        },
        edgeElasticity: function (edge) {
            // switch (edge.data().type) {
            //     case 1 :
            //         return 50;
            //     case 2 :
            //     case 3 :
            //         return 200;
            //     case 0 :
            //     default :
            //         return 100;
            // }
            return _.random(80, 260);
        },
        nestingFactor: 1.2,
        initialTemp: 1000,
        coolingFactor: 0.99,
        minTemp: 1.0,
        gravity: 1.4
    },
    grid: {
        name: "grid"
    },
    random: {
        name: "random"
    },
    spread: {
        name: "spread",
        minDist: 40
    }
};


class CytoscapeModule {
    constructor({ data, api }) {
        this.data = {
            dataUri: data.dataUri,
            layout: data.layout,
            stretched: data.stretched !== undefined ? data.stretched : false
        };
        this.api = api;
        this.wrapper = undefined;
        this.settings = [
            {
                name: 'stretched',
                title: 'Stretch',
                icon: `<svg width="17" height="10" viewBox="0 0 17 10" xmlns="http://www.w3.org/2000/svg"><path d="M13.568 5.925H4.056l1.703 1.703a1.125 1.125 0 0 1-1.59 1.591L.962 6.014A1.069 1.069 0 0 1 .588 4.26L4.38.469a1.069 1.069 0 0 1 1.512 1.511L4.084 3.787h9.606l-1.85-1.85a1.069 1.069 0 1 1 1.512-1.51l3.792 3.791a1.069 1.069 0 0 1-.475 1.788L13.514 9.16a1.125 1.125 0 0 1-1.59-1.591l1.644-1.644z"/></svg>`
            },
            // fullScreen
            // bug 1: when exit, the height of contianer will be stretched to the screen height
            // bug 2: the background color is white in FullScreen. Tried but not work: https://stackoverflow.com/questions/16163089/background-element-goes-black-when-entering-fullscreen-with-html5
            // {
            //     name: 'fullScreen',
            //     title: 'Full Screen',
            //     icon: `<svg xmlns="http://www.w3.org/2000/svg" height="48" width="48" viewBox="0 0 48 48">
            //   <g>
            //     <path id="path1" transform="rotate(0,24,24) translate(11.0000193714818,11) scale(0.81249883771109,0.81249883771109)" d="M11.585977,18.999021L12.999977,20.41302 3.4147511,30.000045 9.999999,30.000045 9.999999,32.000045 0,32.000045 0,22.000045 2,22.000045 2,28.586798z M20.414059,18.998996L29.999999,28.586804 29.999999,22.000045 31.999999,22.000045 31.999999,32.000045 21.999999,32.000045 21.999999,30.000045 28.585288,30.000045 18.999996,20.412996z M21.999999,0L31.999999,0 31.999999,9.999999 29.999999,9.999999 29.999999,3.4131746 20.413977,13.001045 18.999977,11.587039 28.585168,2 21.999999,2z M0,0L9.999999,0 9.999999,2 3.4148293,2 13.000021,11.587039 11.586021,13.001045 2,3.4131756 2,9.999999 0,9.999999z" />
            //   </g>
            // </svg>`
            // }
        ];
    }

    static get toolbox() {
        return {
            title: 'Cytoscape',
            // icon from: js.cytoscape.org/img/cytoscape-logo.svg
            icon: '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0" y="0" width="630" height="630" viewBox="0, 0, 630, 630"><defs><clipPath id="Clip_1"><path d="M211.883,187.846 L602.946,187.846 L602.946,578.909 L211.883,578.909 z"/></clipPath></defs><g id="logo"><path d="M0,0 L630,0 L630,630 L0,630 z" fill="#F7DF1E" id="background"/><path d="M166.65,524.784 L214.863,495.607 C224.164,512.098 232.625,526.051 252.92,526.051 C272.374,526.051 284.639,518.441 284.639,488.841 L284.639,287.541 L343.842,287.541 L343.842,489.678 C343.842,550.998 307.899,578.909 255.458,578.909 C208.096,578.909 180.605,554.381 166.65,524.779" fill="#000000" id="j" display="none"/><path d="M375,520.13 L423.206,492.219 C435.896,512.943 452.389,528.166 481.568,528.166 C506.099,528.166 521.741,515.901 521.741,498.985 C521.741,478.686 505.673,471.496 478.606,459.659 L463.809,453.311 C421.094,435.13 392.759,412.294 392.759,364.084 C392.759,319.68 426.59,285.846 479.454,285.846 C517.091,285.846 544.156,298.957 563.607,333.212 L517.511,362.814 C507.361,344.631 496.369,337.443 479.454,337.443 C462.115,337.443 451.119,348.438 451.119,362.814 C451.119,380.576 462.115,387.766 487.486,398.763 L502.286,405.105 C552.611,426.674 580.946,448.663 580.946,498.139 C580.946,551.426 539.08,580.604 482.836,580.604 C427.86,580.604 392.336,554.386 375,520.13" fill="#000000" id="s" display="none"/><g clip-path="url(#Clip_1)" id="cytoscape-logo"><path d="M520.194,478.644 C547.125,478.644 568.966,500.488 568.966,527.419 C568.966,554.347 547.125,576.191 520.194,576.191 C493.263,576.191 471.419,554.347 471.419,527.419 C471.419,514.948 476.154,503.102 484.568,494.111 L462.669,450.403 C460.537,450.657 458.39,450.784 456.239,450.784 C445.315,450.784 434.77,447.509 425.847,441.408 L401.05,463.246 C401.22,464.527 401.301,465.82 401.301,467.121 C401.301,483.549 387.976,496.878 371.545,496.878 C355.114,496.878 341.785,483.549 341.785,467.121 C341.785,450.686 355.114,437.358 371.545,437.358 C374.38,437.358 377.186,437.762 379.891,438.55 L405.72,415.803 C404.404,412.307 403.462,408.683 402.902,404.987 L341.328,396.693 C332.904,412.349 316.476,422.354 298.37,422.354 C271.442,422.354 249.598,400.51 249.598,373.582 C249.598,346.65 271.442,324.81 298.37,324.81 C322.065,324.81 342.071,341.805 346.314,364.587 L407.874,372.884 C408.285,372.056 408.715,371.242 409.168,370.437 L362.13,322.405 C356.026,325.051 349.44,326.416 342.736,326.416 C315.805,326.416 293.964,304.575 293.964,277.644 C293.964,250.716 315.805,228.872 342.736,228.872 C359.265,228.872 374.484,237.208 383.436,250.765 L454.567,232.825 C457.761,208.908 478.259,190.564 502.909,190.564 C529.837,190.564 551.681,212.408 551.681,239.336 C551.681,265.599 530.909,287.02 504.907,288.069 L485.634,351.571 C500.83,361.446 510.196,378.395 510.196,396.827 C510.196,412.297 503.61,426.828 492.256,437.002 L513.357,479.123 C515.619,478.804 517.903,478.644 520.194,478.644 z M454.346,342.903 L473.882,278.53 C468.893,274.832 464.647,270.207 461.381,264.921 L391.257,282.607 C390.628,288.799 388.829,294.789 385.939,300.29 L432.85,348.192 C439.56,344.959 446.863,343.16 454.346,342.903 z" fill="#000000"/></g></g></svg>'
        };
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
                if(tune.name === "fullScreen"){
                    requestFullScreen(this.wrapper);
                } // fullScreen
                else{
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
        this.wrapper.classList.add('cytoscape-module');
        if (this.data && this.data.dataUri && this.data.layout) {
            this._createCytoscape(this.data.dataUri, this.data.layout);
            return this.wrapper;
        }

        const inputDataUrl = document.createElement('input');
        inputDataUrl.classList.add('w-100');

        this.wrapper.appendChild(inputDataUrl);

        inputDataUrl.placeholder = 'Paste an data URL...';
        inputDataUrl.value = this.data && this.data.dataUri ? this.data.dataUri : "";

        // defualt layout
        this.data.layout = 'spread';

        inputDataUrl.addEventListener('paste', (event) => {
            //this._createImage(event.clipboardData.getData('text'));
            this.data.dataUri = event.clipboardData.getData('text');
            //this.data.dataUri = inputDataUrl.value;
            //this._createCytoscape();
        });

        inputDataUrl.addEventListener('keyup', (event) => {
            if (event.keyCode === 13) {
                this.data.dataUri = inputDataUrl.value;
                //this._createCytoscape();
            }

        });

        return this.wrapper;
    }

    _toggleTune(tune) {
        this.data[tune] = !this.data[tune];
        this._acceptTuneView();
    }

    _acceptTuneView() {
        this.settings.forEach( tune => {
            this.wrapper.classList.toggle(tune.name, !!this.data[tune.name]);
            if (tune.name === 'stretched') {
                this.api.blocks.stretchBlock(this.api.blocks.getCurrentBlockIndex(), !!this.data.stretched);
                this._tryRefreshCyAfterResize();
            }
        });
    }

    _tryRefreshCyAfterResize(){
        if(this.cy){
            this.cy.resize();
            this.cy.center();
        }
    }

    _computeHash(str) {
        var hash = 0;
        if (str.length === 0) {
            return hash;
        }
        for (var i = 0; i < str.length; i++) {
            var char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    }

    _setupFullScreen(){
        if (this.wrapper.addEventListener){ // listen to exitFullScreen
            this.wrapper.addEventListener('webkitfullscreenchange', () => { this._tryRefreshCyAfterResize(); }, false);
            this.wrapper.addEventListener('mozfullscreenchange', () => { this._tryRefreshCyAfterResize(); }, false);
            this.wrapper.addEventListener('fullscreenchange', () => { this._tryRefreshCyAfterResize(); }, false);
            this.wrapper.addEventListener('MSFullscreenChange', () => { this._tryRefreshCyAfterResize(); }, false);
        }
        // change bg to white(default: black) while fullscreen
        // var css = `*:fullscreen, *:-webkit-full-screen, *:-moz-full-screen, *:-ms-full-screen {
        //     background-color: rgba(255,255,255,0.5);
        // }`;
        // var style = document.createElement('style');
        // if (style.styleSheet) {
        //     style.styleSheet.cssText = css;
        // } else {
        //     style.appendChild(document.createTextNode(css));
        // }
        // this.wrapper.appendChild(style);
    }

    _buildSelectOption(eleSelect, optionValue, optionTitle){
        const opt = document.createElement('option');
        opt.setAttribute("value", optionValue);
        opt.text = optionTitle;
        // append to select
        eleSelect.appendChild(opt);
        return opt;
    }

    _initCyLayout(divLayout){
        const eleSelect = document.createElement('select');
        eleSelect.setAttribute("data-role", "select");
        // init options list
        this._buildSelectOption(eleSelect, "breadthfirst", "breadthfirst");
        this._buildSelectOption(eleSelect, "circle", "circle");
        this._buildSelectOption(eleSelect, "concentric", "concentric");
        this._buildSelectOption(eleSelect, "cose", "cose");
        this._buildSelectOption(eleSelect, "grid", "grid");
        this._buildSelectOption(eleSelect, "random", "random");
        var defaultLayout = this._buildSelectOption(eleSelect, "spread", "spread");
        defaultLayout.setAttribute("selected", "selected");
        // onchange
        eleSelect.onchange = (event)=>{
            var selectElement = event.target;
            this.data.layout = selectElement.value;
            var tmp = this.cy.layout(cyLayoutOptions[selectElement.value]);
            tmp.run();
        };
        // append to div
        divLayout.appendChild(eleSelect);
    }

    _initCytoscape(data, divId) {
        // container
        //this.divCytoscapeModuleContainer = document.createElement('div');

        // cy core
        const divCy = document.createElement('div');
        divCy.setAttribute("id", divId);
        divCy.setAttribute("style", "min-height: 500px; min-width: 500px;");
        divCy.classList.add('w-100');
        divCy.classList.add('h-100');
        divCy.classList.add('border');
        divCy.classList.add('bd-lightGray');

        // cy layout
        const divCyLayout = document.createElement('div');
        this._initCyLayout(divCyLayout);

        this.wrapper.innerHTML = '';
        this.wrapper.appendChild(divCy);
        this.wrapper.appendChild(divCyLayout);
        this.wrapper.classList.add('support-full-screen');

        this._setupFullScreen();

        var layoutName = this.data.layout.trim();

        var cy = cytoscape({
            container: divCy, //document.getElementById(elementId), // container to render in
            zoom: 1,
            elements: data,
            style: cyStyles,
            layout: {
                name: layoutName
            }
        });
        this.cy = cy;
    }

    _createCytoscape(dataUri, layoutName) {
        if (!dataUri || !layoutName) {
            return;
        }

        //dataUri = "https://raw.githubusercontent.com/taurenshaman/taurenshaman.github.io/master/data/cytoscape-0.json";
        var uriHash = this._computeHash(dataUri);// + "#" + layoutName
        var divCyId = "divCy_" + uriHash;
        var exists = document.getElementById(divCyId);
        if (exists) {
            return;
        }

        console.log("read to get: " + dataUri);
        var req = new XMLHttpRequest();
        req.open('GET', dataUri);
        req.onload = () => {
            if (req.status === 200) {
                var j = JSON.parse(req.response);
                console.log(j);
                this._initCytoscape(j, divCyId);
            } else {
                console.log(req.statusText);
            }
            this._acceptTuneView();
        };
        req.send();
    }

    save(blockContent) {
        //const input = blockContent.querySelector('input');
        // const inputDataUri = blockContent.querySelector('.data_uri');
        // var dataUri = inputDataUri.value;

        var dataUri = this.data.dataUri;
        var layoutName = this.data.layout;
        console.log(layoutName + ": " + dataUri);

        this._createCytoscape(dataUri, layoutName);

        // return {
        //     dataUri: dataUri,
        //     layout: layoutName
        // };
        return Object.assign(this.data, {
            dataUri: dataUri,
            layout: layoutName
        });
    }

    validate(savedData) {
        if (!savedData.dataUri || !savedData.layout || !savedData.dataUri.trim() || !savedData.layout.trim()) {
            return false;
        }
        return true;
    }

}
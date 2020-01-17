"use strict";
class LoreService {
    constructor(appId, appSecret) {
        this.appId = appId;
        this.appSecret = appSecret;
    }
    getNoteByURL(url, callback) {
        var uri = LoreService.getUri_Api_GetNote(url);
        $.ajax({
            url: uri,
            dataType: "json",
            type: "GET",
            contentType: 'application/x-www-form-urlencoded',
            data: "appid=" + this.appId,
            async: true,
            processData: false,
            cache: false,
            crossDomain: true,
            success: function (data, textStatus, jqXHR) {
                if (typeof callback === "function") {
                    callback(data);
                    return;
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                var msgError = "��Status��" + textStatus + "��error��" + errorThrown + "��others��" + jqXHR.responseText;
                UIHelper.ShowError("ERROR", msgError);
            }
        });
    }
    getNote(author, domain, docId, callback) {
        var uri = "/api/" + LoreService.apiVersion + "/" + author + "/" + domain + "/" + docId;
        this.getNoteByURL(uri, callback);
    }
    static getUri_Api_GetNote(uri) {
        var apiUri = uri;
        if (uri.startsWith("https://localhost") && !uri.startsWith("https://localhost:44356/api")) {
            LoreService.apiUriPrefix = "https://localhost:44356/api/" + LoreService.apiVersion + "/";
            var uriPrefix_Localhost = "https://localhost:44356/";
            apiUri = LoreService.apiUriPrefix + uri.substring(uriPrefix_Localhost.length);
        }
        else if (uri.startsWith("https://lore.chuci.info") && !uri.startsWith("https://lore.chuci.info/api")) {
            LoreService.apiUriPrefix = "https://lore.chuci.info/api/" + LoreService.apiVersion + "/";
            apiUri = LoreService.apiUriPrefix + uri.substring(LoreService.uriPrefix.length);
        }
        return apiUri;
    }
    static getUri_NoteLink(uri) {
        var link = uri;
        var apiString = "/api/" + LoreService.apiVersion;
        if (uri.indexOf(apiString) >= 0) {
            link = uri.replace(apiString, "");
        }
        return link;
    }
    static getUri_Author_FromNoteLink(noteLink) {
        var tmpPrefix = LoreService.uriPrefix;
        if (noteLink.startsWith("https://localhost")) {
            tmpPrefix = "https://localhost:44356/";
        }
        var link = noteLink.substring(tmpPrefix.length);
        var index = link.indexOf("/");
        var authorName = link.substring(0, index);
        return tmpPrefix + authorName;
    }
    static getUserName_FromAuthorLink(authorLink) {
        var index = authorLink.lastIndexOf("/");
        var name = authorLink.substring(index + 1);
        return name;
    }
    static fitDialog(json) {
        var agents = json.agents;
        _.forEach(json.items, (item) => {
            var agentId = item.agentId;
            var agent = _.find(agents, function (o) { return o.id === agentId; });
            item.name = agent.name;
            item.avatar = "https://robohash.org/" + agentId + ".png";
            item.time = new Date(item.time);
        });
        return json.items;
    }
}
LoreService.uriPrefix = "https://lore.chuci.info/";
LoreService.apiVersion = "v1";
LoreService.apiUriPrefix = "https://lore.chuci.info/api/" + LoreService.apiVersion + "/";
class LoreCard {
    static inititialize() {
        if (typeof LoreCard.api === "undefined") {
            LoreCard.initService("", "");
        }
        return LoreCard.api;
    }
    static initService(appId, appSecret) {
        LoreCard.api = new LoreService(appId, appSecret);
        return LoreCard.api;
    }
}
class LoreEditor {
    constructor(editor) {
        this.editor = editor;
    }
    init() {
    }
}
class ModuleBase {
    constructor(moduleName) {
        this.loreService = LoreCard.inititialize();
        this.ModuleName = moduleName;
    }
    getDataUri(data) {
        var lines = data.match(/^.*((\r\n|\n|\r)|$)/gm);
        var dataUri = "";
        if (lines && lines.length > 0) {
            lines.forEach(element => {
                if (element.startsWith("dataUri:")) {
                    dataUri = _.replace(element, "dataUri:", "");
                }
                else if (element.startsWith("data:")) {
                    dataUri = _.replace(element, "data:", "");
                }
                else if (element.startsWith("uri:")) {
                    dataUri = _.replace(element, "uri:", "");
                }
            });
            dataUri = _.trim(dataUri);
        }
        return dataUri;
    }
    prepare() { }
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
    save(blockContent) {
        this.prepare();
        return Object.assign(this.data, {
            data: this.dataUri
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
            }
        });
    }
    validate(savedData) {
        if (!savedData.data || !savedData.data.trim()) {
            return false;
        }
        return true;
    }
}
class LoreCard_List extends ModuleBase {
    constructor({ data, config, api }) {
        super("lorecard.list");
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
            }
        ];
    }
    static get toolbox() {
        return {
            title: 'lore:> list',
            icon: SVGConstants.SVG_Note_List
        };
    }
    createItem(containerUL, title, description) {
        const liItem = document.createElement("li");
        const h4 = document.createElement("h4");
        h4.innerText = title;
        liItem.appendChild(h4);
        const p = document.createElement("p");
        p.classList.add("w-100");
        p.innerText = description;
        liItem.appendChild(p);
        containerUL.appendChild(liItem);
        return liItem;
    }
    initCard(ctx, data) {
        const ul = document.createElement("ul");
        ul.classList.add("step-list");
        var ctxInit = this;
        _.forEach(data.items, item => {
            ctxInit.createItem(ul, item.title, item.description);
        });
        ctx.wrapper.innerHTML = "";
        ctx.wrapper.appendChild(ul);
    }
    renderSettings() {
        const wrapper = document.createElement('div');
        this.settings.forEach(tune => {
            let button = document.createElement('div');
            button.classList.add(this.api.styles.settingsButton);
            button.classList.toggle(this.api.styles.settingsButtonActive, this.data[tune.name]);
            button.innerHTML = tune.icon;
            button.setAttribute("title", tune.title);
            wrapper.appendChild(button);
            button.addEventListener('click', () => {
                if (tune.name === "navNote") {
                    CommonUtitlity.OpenLink(this.noteLink);
                }
                else if (tune.name === "navAuthor") {
                    CommonUtitlity.OpenLink(this.authorLink);
                }
                else {
                    this._toggleTune(tune.name);
                    button.classList.toggle(this.api.styles.settingsButtonActive);
                }
            });
        });
        return wrapper;
    }
    prepare() {
        if (!this.dataUri) {
            return;
        }
        this.noteLink = LoreService.getUri_NoteLink(this.dataUri);
        this.authorLink = LoreService.getUri_Author_FromNoteLink(this.dataUri);
        var uriHash = CommonUtitlity.ComputeHash(this.dataUri);
        this.wrapperId = "divLoreList_" + uriHash;
        var ctxGetData = this;
        this.loreService.getNoteByURL(this.dataUri, (data) => {
            var cy = ctxGetData.initCard(ctxGetData, data);
        });
    }
}
class LoreCard_Mind extends ModuleBase {
    constructor({ data, config, api }) {
        super("lorecard.mind");
        this.CyCache = {};
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
        var sfsCtx = this;
        UIHelper.SetupFullScreen(wrapper, sfsCtx.tryRefreshCyAfterResize(wrapperId));
    }
    tryRefreshCyAfterResize(wrapperId) {
        var cy = this.CyCache[wrapperId];
        if (cy) {
            cy.zoom(1);
            cy.resize();
            cy.center();
        }
    }
    initCard(ctx, data) {
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
            container: divCy,
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
            button.classList.add(this.api.styles.settingsButton);
            button.classList.toggle(this.api.styles.settingsButtonActive, this.data[tune.name]);
            button.innerHTML = tune.icon;
            button.setAttribute("title", tune.title);
            wrapper.appendChild(button);
            button.addEventListener('click', () => {
                if (tune.name === "fullScreen") {
                    UIHelper.LaunchFullScreen(this.wrapper);
                }
                else if (tune.name === "navNote") {
                    CommonUtitlity.OpenLink(this.noteLink);
                }
                else if (tune.name === "navAuthor") {
                    CommonUtitlity.OpenLink(this.authorLink);
                }
                else {
                    this._toggleTune(tune.name);
                    button.classList.toggle(this.api.styles.settingsButtonActive);
                }
            });
        });
        return wrapper;
    }
    prepare() {
        if (!this.dataUri) {
            return;
        }
        this.noteLink = LoreService.getUri_NoteLink(this.dataUri);
        this.authorLink = LoreService.getUri_Author_FromNoteLink(this.dataUri);
        var uriHash = CommonUtitlity.ComputeHash(this.dataUri);
        this.wrapperId = "divLoreMind_" + uriHash;
        var ctxGetData = this;
        this.loreService.getNoteByURL(this.dataUri, (data) => {
            var cy = ctxGetData.initCard(ctxGetData, data);
        });
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
}
LoreCard_Mind.cyStyles = [
    {
        selector: "node",
        style: {
            "text-wrap": "wrap",
            "text-max-width": "200px",
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
        selector: "edge",
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
class LoreCard_Section extends ModuleBase {
    constructor({ data, config, api }) {
        super("lorecard.section");
        this.data = {
            data: data.data,
            stretched: data.stretched !== undefined ? data.stretched : false
        };
        this.config = config || {};
        this.api = api;
        this.wrapper = undefined;
        this.settings = [
            {
                name: 'navNote',
                title: 'Open Note',
                icon: SVGConstants.SVG_Arrow_Open_Blank
            },
            {
                name: 'navAuthor',
                title: 'Author',
                icon: SVGConstants.SVG_User_Info
            }
        ];
    }
    static get toolbox() {
        return {
            title: 'lore:> section',
            icon: SVGConstants.SVG_Note_Section
        };
    }
    createCardHeader(wrapperId, title) {
        const div = document.createElement("div");
        div.classList.add("card-header");
        div.innerText = title;
        return div;
    }
    createCardFooter(wrapperId) {
        const btn = document.createElement("button");
        btn.classList.add("flat-button", "mif-arrow-right", "mif-2x", "fg-black");
        btn.onclick = (ev) => {
            $("#" + wrapperId).toggleClass("active");
        };
        const div = document.createElement("div");
        div.classList.add("card-footer");
        div.appendChild(btn);
        return div;
    }
    createCardContent(wrapperId, side) {
        var divEditor = document.createElement("div");
        divEditor.id = "viewer_" + side + "_" + wrapperId;
        divEditor.style.height = "360px";
        divEditor.style.overflowY = "auto";
        const div = document.createElement("div");
        div.classList.add("card-content");
        div.appendChild(divEditor);
        return div;
    }
    createMetroCard(wrapperId, side, title) {
        const divHeader = this.createCardHeader(wrapperId, title);
        const divContent = this.createCardContent(wrapperId, side);
        const divFooter = this.createCardFooter(wrapperId);
        const divCard = document.createElement("div");
        divCard.classList.add("card");
        divCard.appendChild(divHeader);
        divCard.appendChild(divContent);
        divCard.appendChild(divFooter);
        return divCard;
    }
    createCardSide(wrapperId, side, title) {
        const divCard = this.createMetroCard(wrapperId, side, title);
        const divSide = document.createElement("div");
        divSide.classList.add(side);
        divSide.appendChild(divCard);
        return divSide;
    }
    initCard(ctx, data) {
        var divSection = document.createElement('div');
        divSection.setAttribute("id", ctx.wrapperId);
        divSection.classList.add("flip-card", "effect-on-active");
        divSection.style.width = "360px";
        divSection.style.height = "520px";
        var divFront = this.createCardSide(this.wrapperId, "front", data.title);
        var divBack = this.createCardSide(this.wrapperId, "back", data.title);
        divSection.appendChild(divFront);
        divSection.appendChild(divBack);
        this.wrapper.innerHTML = "";
        this.wrapper.appendChild(divSection);
        setTimeout(() => {
            var vf = document.getElementById('viewer_front_' + this.wrapperId);
            vf.innerText = data.front.content;
            var vb = document.getElementById('viewer_back_' + this.wrapperId);
            vb.innerText = data.back.content;
        }, 100);
    }
    renderSettings() {
        const wrapper = document.createElement('div');
        this.settings.forEach(tune => {
            let button = document.createElement('div');
            button.classList.add(this.api.styles.settingsButton);
            button.classList.toggle(this.api.styles.settingsButtonActive, this.data[tune.name]);
            button.innerHTML = tune.icon;
            button.setAttribute("title", tune.title);
            wrapper.appendChild(button);
            button.addEventListener('click', () => {
                if (tune.name === "navNote") {
                    CommonUtitlity.OpenLink(this.noteLink);
                }
                else if (tune.name === "navAuthor") {
                    CommonUtitlity.OpenLink(this.authorLink);
                }
                else {
                    this._toggleTune(tune.name);
                    button.classList.toggle(this.api.styles.settingsButtonActive);
                }
            });
        });
        return wrapper;
    }
    prepare() {
        if (!this.dataUri) {
            return;
        }
        this.noteLink = LoreService.getUri_NoteLink(this.dataUri);
        this.authorLink = LoreService.getUri_Author_FromNoteLink(this.dataUri);
        var uriHash = CommonUtitlity.ComputeHash(this.dataUri);
        this.wrapperId = "divLoreSection_" + uriHash;
        var ctxGetData = this;
        this.loreService.getNoteByURL(this.dataUri, (data) => {
            var cy = ctxGetData.initCard(ctxGetData, data);
        });
    }
}
class UIHelper {
    static ShowCharm(id) {
        var charm = $("#" + id).data("charms");
        charm.open();
    }
    static HideCharm(id) {
        var charm = $("#" + id).data("charms");
        charm.close();
    }
    static ShowOrHideCharm(id, canClose) {
        var charm = $("#" + id).data("charms");
        if (charm.element.data("opened") === true && canClose === true) {
            charm.close();
        }
        else {
            charm.open();
        }
    }
    static disableElement(id) {
        $("#" + id).attr('disabled', "true");
    }
    static enableElement(id) {
        $("#" + id).attr('disabled', "false");
    }
    static ShowMessage(title, message) {
        Metro.notify.create(message, title, {
            cls: "info"
        });
    }
    static ShowError(title, error) {
        Metro.notify.create(error, title, {
            cls: "alert"
        });
    }
    static ToastError(msg) {
        var toast = Metro.toast.create;
        toast(msg, null, 5000, "bg-red fg-white");
    }
    static ToastMessage(msg) {
        var toast = Metro.toast.create;
        toast(msg, null, 5000, "bg-green fg-white");
    }
    static LaunchFullScreen(element) {
        if (element.requestFullscreen) {
            element.requestFullscreen();
        }
        else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        }
        else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        }
        else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    }
    static SetupFullScreen(element, callbackFullScreenChange) {
        if (element.addEventListener) {
            element.addEventListener('webkitfullscreenchange', () => {
                if (callbackFullScreenChange) {
                    callbackFullScreenChange();
                }
            }, false);
            element.addEventListener('mozfullscreenchange', () => {
                if (callbackFullScreenChange) {
                    callbackFullScreenChange();
                }
            }, false);
            element.addEventListener('fullscreenchange', () => {
                if (callbackFullScreenChange) {
                    callbackFullScreenChange();
                }
            }, false);
            element.addEventListener('MSFullscreenChange', () => {
                if (callbackFullScreenChange) {
                    callbackFullScreenChange();
                }
            }, false);
        }
    }
    static getIcon(noteType) {
        var icon = "mif-embed2";
        switch (noteType) {
            case ModelData.Type_Document:
                icon = 'mif-file-code';
                break;
            case ModelData.Type_Mind:
                icon = 'mif-share';
                break;
            case ModelData.Type_Section:
                icon = 'mif-book-reference';
                break;
            case ModelData.Type_Dialog:
                icon = 'mif-chat-bubble-outline';
                break;
            case ModelData.Type_XY:
                icon = 'mif-windows';
                break;
            case ModelData.Type_5W2H1E:
                icon = 'mif-dashboard';
                break;
            case ModelData.Type_Topic:
                icon = 'mif-folder-special2';
                break;
            case ModelData.Type_LanguagePack:
                icon = 'mif-language';
                break;
            case ModelData.ItemType_vocabulary:
                icon = 'mif-language';
                break;
            default:
                icon = 'mif-embed2';
                break;
        }
        return icon;
    }
}
class ModelData {
}
ModelData.Type_Document = "document";
ModelData.Type_Article = "article";
ModelData.Type_Couplet = "couplet";
ModelData.Type_Dialog = "dialog";
ModelData.Type_Section = "section";
ModelData.Type_Mind = "mind";
ModelData.Type_XY = "xy";
ModelData.Type_5W2H1E = "5w2h1e";
ModelData.Type_Topic = "topic";
ModelData.Type_LanguagePack = "language-pack";
ModelData.Type_MathPack = "math-pack";
ModelData.Type_HistoryPack = "history-pack";
ModelData.ItemType_vocabulary = "language:vocabulary";
class CommonUtitlity {
    static ComputeHash(str) {
        var hash = 0;
        if (str.length === 0) {
            return hash;
        }
        for (var i = 0; i < str.length; i++) {
            var char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash;
    }
    static OpenLink(url) {
        window.open(url, '_blank');
    }
}
class SVGConstants {
}
SVGConstants.SVG_Arrow_LeftRight = `<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" height="32" width="32" viewBox="0 0 32 32">
  <g>
    <path id="path1" transform="rotate(0,16,16) translate(8,12.9690965566165) scale(0.499984324469884,0.499984324469884)  " fill="orange" d="M6.0190067,0.16500799L7.4250088,1.5890061 3.9923439,4.979006 14.419033,4.979006 14.419033,6.9799988 3.699379,6.9799988 7.4300079,10.708995 6.015007,12.123994 0,6.1090004z M25.982016,0L32.001003,5.9430005 25.985983,11.958999 24.571004,10.543993 28.167773,6.9479963 18.027001,6.9479963 18.027001,4.9470035 28.144115,4.9470035 24.576009,1.4240091z" />
  </g>
</svg>`;
SVGConstants.SVG_Arrow_Open_Blank = `<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" height="32" width="32" viewBox="0 0 32 32">
  <g>
    <path id="path1" transform="rotate(0,16,16) translate(8,11.3024997711182) scale(0.5,0.5)  " fill="orange" d="M21.575989,0L32,9.0769969 21.390991,17.842995 20.208008,16.409996 28.848999,9.2729961C8.6690063,4.3729998,1.967041,18.186997,1.6870117,18.790001L0,18.010994C0.072021484,17.856995,6.960022,3.4460021,26.697021,6.9219991L20.356995,1.4000011z" />
  </g>
</svg>`;
SVGConstants.SVG_FullScreen = `<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" height="32" width="32" viewBox="0 0 32 32">
  <g>
    <path id="path1" transform="rotate(0,16,16) translate(8.00000095367409,8) scale(0.499999880790739,0.499999880790739)  " fill="orange" d="M11.525997,19.060009L12.939997,20.47401 3.4139986,30.000008 9.9999971,30.000008 9.9999971,32.000008 0,32.000008 0,22.000009 1.9999981,22.000009 1.9999981,28.586008z M20.474002,19.059994L30,28.588991 30,21.999992 31.999999,21.999992 31.999999,31.99999 22.000001,31.99999 22.000001,29.99999 28.583,29.99999 19.060002,20.473993z M0,7.1525589E-06L10.000003,7.1525589E-06 10.000003,2.000008 3.4150009,2.000008 13.079004,11.667013 11.665004,13.081014 2,3.4130091 2,10.000012 0,10.000012z M22.000002,0L32.000002,0 32.000002,10.000005 30.000002,10.000005 30.000002,3.4129962 20.332003,13.081 18.918002,11.666998 28.585009,2.0000009 22.000002,2.0000009z" />
  </g>
</svg>`;
SVGConstants.SVG_User_Info = `<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" height="32" width="32" viewBox="0 0 32 32">
  <g>
    <path id="path1" transform="rotate(0,16,16) translate(8,8) scale(0.5,0.5)  " fill="orange" d="M23.284966,23.126986L24.742958,23.126986 24.742958,28.5 23.284966,28.5z M24.013979,19.500005C24.564986,19.500005 25.011993,19.971008 25.011993,20.55101 25.011993,21.131013 24.564986,21.602015 24.013979,21.602015 23.462971,21.602015 23.015965,21.131013 23.015965,20.55101 23.015965,19.971008 23.462971,19.500005 24.013979,19.500005z M24,18C20.69104,18 18,20.690979 18,24 18,27.309021 20.69104,30 24,30 27.30896,30 30,27.309021 30,24 30,20.690979 27.30896,18 24,18z M14,2C10.968,2 8.5,4.467 8.5,7.5 8.5,10.438219 10.81616,12.84526 13.717461,12.99283L13.973189,12.99932 13.999969,12.998981 14.028288,12.999282 14.282539,12.99283C17.18384,12.84526 19.5,10.438219 19.5,7.5 19.5,4.467 17.032,2 14,2z M14,0C18.136,0 21.5,3.3640003 21.5,7.5 21.5,9.95575 20.314059,12.13934 18.484733,13.508212L18.26509,13.664511 18.342722,13.68888C19.921901,14.202708,21.408062,14.995077,22.721599,16.03736L22.788475,16.091633 22.982541,16.064397C23.315797,16.021905 23.65539,16 24,16 28.411011,16 32,19.588989 32,24 32,28.411011 28.411011,32 24,32 19.588989,32 16,28.411011 16,24 16,20.96743 17.696358,18.323394 20.189945,16.967021L20.41569,16.851236 20.411498,16.848535C18.622935,15.723574,16.553731,15.082332,14.426189,15.006571L14.033347,14.999577 14,15 13.959781,14.999489 13.690718,15.002884C7.2160797,15.166407,1.9999952,20.44972,1.9999952,26.921989L0,26.928989 0,26.921989C0,20.804377,3.9878531,15.595463,9.51441,13.731753L9.730948,13.661691 9.5152664,13.508212C7.6859417,12.13934 6.5,9.95575 6.5,7.5 6.5,3.3640003 9.8639998,0 14,0z" />
  </g>
</svg>`;
SVGConstants.SVG_Note_Mind = `<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" height="32" width="32" viewBox="0 0 32 32">
  <g>
    <path id="path1" transform="rotate(0,16,16) translate(8,8.18225377240642) scale(0.49999982118613,0.49999982118613)  " fill="orange" d="M27.571313,24.769906C27.353357,24.769906 27.134364,24.797906 26.918363,24.851899 26.281343,25.015904 25.748325,25.402911 25.420324,25.942919 25.091346,26.481929 25.006324,27.109938 25.179359,27.709952 25.353368,28.31096 25.765353,28.811959 26.338348,29.12097 26.91232,29.430972 27.580346,29.509968 28.218343,29.347979 28.855302,29.184966 29.388318,28.797967 29.716319,28.25795 30.04432,27.717948 30.130319,27.089932 29.95631,26.490924 29.783336,25.889918 29.371351,25.388911 28.798356,25.079907 28.418353,24.874901 27.996358,24.769906 27.571313,24.769906z M4.429477,13.083719C4.0384882,13.083719 3.6504901,13.172725 3.2924597,13.346723 2.7064645,13.632731 2.2725072,14.117739 2.0724957,14.710744 1.8724849,15.303755 1.9294915,15.934761 2.2344825,16.485772 2.5384968,17.038783 3.0534475,17.445786 3.685463,17.634793 4.9834902,18.018794 6.3784406,17.342787 6.7904256,16.118769 6.9904368,15.525758 6.93343,14.895752 6.6284392,14.342742 6.324425,13.790731 5.8094742,13.382727 5.1794727,13.194721 4.9334414,13.120722 4.6794756,13.083719 4.429477,13.083719z M27.477319,1.8395491C27.088344,1.8395491 26.698331,1.927548 26.342315,2.1015469 25.75632,2.3885536 25.322362,2.8725623 25.122352,3.4655735 24.922342,4.0585777 24.979347,4.6895916 25.284339,5.2416021 25.588353,5.793605 26.103364,6.2026159 26.733365,6.3906147 27.363305,6.5776216 28.031331,6.5246193 28.620319,6.2376124 29.206313,5.9516122 29.640331,5.4666044 29.840343,4.874592L29.840343,4.8735926C30.040292,4.2805812 29.983346,3.6495747 29.678294,3.0975644 29.374341,2.5455539 28.85933,2.1375503 28.229329,1.949544 27.983358,1.8765447 27.729331,1.8395491 27.477319,1.8395491z M27.536552,0.00036219875C27.968139,0.0057348481 28.400554,0.070891721 28.821306,0.1965183 29.949291,0.53352916 30.869329,1.2625367 31.413331,2.2515504 31.959289,3.2395648 32.0603,4.3685877 31.703307,5.4306008 31.346315,6.4916217 30.569343,7.3586318 29.5193,7.8706409 28.880327,8.1826417 28.185323,8.3406493 27.485315,8.3406493 27.036342,8.3406493 26.582366,8.2756459 26.141328,8.1436402 25.330358,7.9016396 24.655374,7.449629 24.137372,6.8826267L8.7144263,14.406738C8.8604214,14.95575,8.8834307,15.532755,8.7784512,16.114764L24.182355,24.419894C24.75834,23.773886 25.523351,23.30288 26.406341,23.077878 27.548364,22.784873 28.743303,22.929873 29.769298,23.482882 30.796331,24.036893 31.531312,24.932902 31.842284,26.006924 32.153318,27.081937 32.001279,28.205947 31.413331,29.171965 30.825322,30.138991 29.871349,30.830989 28.729326,31.123 28.344318,31.222001 27.951316,31.270997 27.561364,31.270997 26.800321,31.270997 26.046357,31.083998 25.366369,30.717995 24.339336,30.163985 23.605333,29.266968 23.29436,28.192946 23.088367,27.483937 23.104358,26.756936 23.295337,26.063924L8.0334609,17.834792C7.2044246,18.926812 5.8554332,19.583819 4.429477,19.583819 3.9864865,19.583819 3.538491,19.520823 3.0934866,19.387818 1.965502,19.050814 1.0435102,18.321799 0.49950709,17.332785 -0.046510372,16.344771 -0.14752298,15.215756 0.20946983,14.154735 0.94847908,11.9627 3.4384551,10.741687 5.7714493,11.441695 6.612448,11.692699 7.313433,12.164706 7.8364403,12.762715L23.215381,5.2605998C22.99834,4.5125872 22.992358,3.7015776 23.259387,2.9095654 23.61638,1.8485443 24.393352,0.98153418 25.443334,0.46852588 26.100221,0.14852011 26.817237,-0.0085924265 27.536552,0.00036219875z" />
  </g>
</svg>`;
SVGConstants.SVG_Note_Section = `<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" height="32" width="32" viewBox="0 0 32 32">
  <g>
    <path id="path1" transform="rotate(0,16,16) translate(9.42975568771362,8) scale(0.5,0.5)  " fill="orange" d="M3.4269456,2.2860025C3.4269456,2.2860025,2.245996,2.6809992,2.245996,3.4680015L14.397774,3.4729988C14.316781,3.4940025,14.24476,3.5610038,14.24476,3.6529991L14.24476,16.721996C14.24476,16.798,14.290781,16.869999,14.367744,16.899998L14.438788,16.915997 14.582768,16.854 17.748733,13.688 20.914695,16.854C20.971641,16.915997 21.057637,16.931996 21.134662,16.899998 21.205646,16.869999 21.251664,16.798 21.251664,16.721996L21.251664,3.6529991C21.251664,3.5660011,21.185687,3.4989997,21.103658,3.4780036L21.712655,3.4780036C22.340636,3.4780036,22.852651,3.9900044,22.852651,4.619002L22.852651,29.819992C23.829625,29.819992,24.03061,29.073998,24.03061,29.073998L24.03061,3.3570014C24.03061,3.3570014,24.065583,2.2860025,22.852651,2.2860025z M3.2119832,0L25.211621,0C25.211621,0,26.279597,0.21500392,26.279597,1.0740051L26.279597,29.641998C26.279597,29.641998,26.367547,30.854996,25.139602,30.854996L22.852651,30.854996C22.852651,31.483002,22.340636,32,21.712655,32L1.1409726,32C0.50701084,32,1.4995385E-07,31.483002,0,30.854996L0,3.4270011C1.4995385E-07,3.4270011,1.4995385E-07,0,3.2119832,0z" />
  </g>
</svg>`;
SVGConstants.SVG_Note_Dialog = `<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" height="32" width="32" viewBox="0 0 32 32">
  <g>
    <path id="path1" transform="rotate(0,16,16) translate(8,9.34999990463257) scale(0.5,0.5)  " fill="orange" d="M16,7.1999997L16,9.8000068 18.5,9.8000068 18.5,7.1999997z M10.900024,7.1999997L10.900024,9.8000068 13.400024,9.8000068 13.400024,7.1999997z M5.7000122,7.1999997L5.7000122,9.8000068 8.2000122,9.8000068 8.2000122,7.1999997z M25.900024,7.0000028C29.5,8.3999967 32,11.200001 32,14.4 32,17.200003 30.100037,19.700005 27.100037,21.200005L29.900024,26.6 23.799988,22.400017C22.799988,22.599998 21.700012,22.800011 20.600037,22.800011 16.900024,22.800011 13.700012,21.499992 11.600037,19.599998L11.900024,19.599998C19.799988,19.599998 26.200012,14.9 26.200012,9.0999946 26.200012,8.3000059 26.100037,7.6999997 25.900024,7.0000028z M12.100037,0C18.799988,6.2173967E-08 24.200012,4.0000014 24.200012,8.8000059 24.200012,13.700002 18.799988,17.599997 12.100037,17.599997 10.900024,17.599997 9.7999878,17.400015 8.7000122,17.200003L2.2000122,21.700005 5.2000122,15.99999C2.1000366,14.500006 0,11.800008 0,8.8000059 0,4.0000014 5.4000244,6.2173967E-08 12.100037,0z" />
  </g>
</svg>`;
SVGConstants.SVG_Note_List = `<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" height="32" width="32" viewBox="0 0 32 32">
  <g>
    <path id="path1" transform="rotate(0,16,16) translate(9.4082498550415,8) scale(0.5,0.5)  " fill="orange" d="M8.715005,26.507996L26.367,26.507996 26.367,30.215996 8.715005,30.215996z M0,23.059998L3.5549961,23.059998 5.3779956,23.059998 5.3779956,32 0,32 0,30.218002 3.5560032,30.218002 3.5560032,28.417999 0,28.417999 0,26.639999 3.5560032,26.639999 3.5560032,24.839996 0,24.839996z M8.715005,13.865997L26.367,13.865997 26.367,17.575996 8.715005,17.575996z M0,10.602997L5.3779956,10.602997 5.3779956,16.053001 1.8149733,16.053001 1.8149733,17.723 5.3779956,17.723 5.3779956,19.579002 0,19.579002 0,14.203003 3.5560032,14.203003 3.5560032,12.456001 0,12.456001z M8.715005,1.223999L26.367,1.223999 26.367,4.9319992 8.715005,4.9319992z M0,0L3.5560032,0 3.5560032,7.0079956 1.7829909,7.0079956 1.7829909,1.8529968 0,1.8529968z" />
  </g>
</svg>`;
SVGConstants.SVG_Note_Tree = `<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" height="32" width="32" viewBox="0 0 32 32">
  <g>
    <path id="path1" transform="rotate(0,16,16) translate(9.29874992370605,8) scale(0.5,0.5)  " fill="orange" d="M13.371006,0C14.806003,0 15.968998,1.3850021 15.968998,3.0940018 15.968998,3.9589996 15.670002,4.7390022 15.190006,5.3000031L19.498007,13.132999C19.797994,12.989002 20.125006,12.905003 20.468008,12.905003 21.903005,12.905003 23.066,14.291 23.066,16 23.066,17.138 22.543997,18.122002 21.774999,18.660004L23.858007,25.854004C23.974005,25.834 24.088003,25.811005 24.207006,25.811005 25.642004,25.811005 26.805,27.196999 26.805,28.904999 26.805,30.614998 25.642004,32 24.207006,32 22.771993,32 21.608999,30.614998 21.608999,28.904999 21.608999,27.767998 22.131002,26.784004 22.899008,26.245003L20.816,19.053001C20.702001,19.070999 20.586996,19.095001 20.468008,19.095001 20.362997,19.095001 20.263006,19.072998 20.162008,19.056999L18.149998,26.370003C18.821997,26.931 19.263998,27.855003 19.263998,28.904999 19.263998,30.614998 18.101002,32 16.666004,32 15.230991,32 14.067005,30.614998 14.067005,28.904999 14.067005,27.196999 15.230991,25.811005 16.666004,25.811005 16.854999,25.811005 17.039005,25.838005 17.215992,25.884003L19.196997,18.683998C18.409,18.151001 17.869999,17.154999 17.869999,16 17.869999,15.135002 18.168995,14.355 18.649008,13.794003L14.340992,5.9600029C14.039997,6.1049995 13.715,6.1879997 13.371006,6.1879997 13.037006,6.1879997 12.720005,6.1070023 12.427996,5.9700012L8.1660021,13.905003C8.6570004,14.468002 8.9669979,15.255005 8.9669979,16.133003 8.9669979,17.258003 8.4570025,18.235001 7.6999992,18.776001L9.8259915,25.857002C9.9499996,25.834999 10.073001,25.811005 10.20299,25.811005 11.638003,25.811005 12.799991,27.196999 12.799991,28.904999 12.799991,30.614998 11.638003,32 10.20299,32 8.7679928,32 7.6039904,30.614998 7.6039904,28.904999 7.6039904,27.779999 8.114992,26.802002 8.8710049,26.262001L6.7460039,19.181999C6.6219958,19.203003 6.4980028,19.227005 6.367998,19.227005 6.2439898,19.227005 6.1250017,19.203003 6.0059984,19.182999L3.9180003,26.253998C4.6799939,26.792999 5.1960004,27.773003 5.1960004,28.904999 5.1960004,30.614998 4.0329908,32 2.597993,32 1.1629948,32 1.6183913E-07,30.614998 0,28.904999 1.6183913E-07,27.196999 1.1629948,25.811005 2.597993,25.811005 2.7220009,25.811005 2.840989,25.834 2.9609996,25.855003L5.0479902,18.783005C4.2870038,18.244003 3.76999,17.264999 3.76999,16.133003 3.76999,14.423004 4.9339917,13.037003 6.367998,13.037003 6.7019976,13.037003 7.0189989,13.118999 7.3119982,13.255001L11.573001,5.321003C11.082003,4.7579994 10.772998,3.9700012 10.772998,3.0940018 10.772998,1.3850021 11.935992,0 13.371006,0z" />
  </g>
</svg>`;
//# sourceMappingURL=lore-editor-codex.editor.js.map
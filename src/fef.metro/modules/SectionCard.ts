/// <reference path="../../apps/LoreCard.ts" />
/// <reference path="./ModuleBase.ts" />

"use strict";

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
            //{
            //    name: 'stretched',
            //    title: 'Stretch',
            //    icon: SVGConstants.SVG_Arrow_LeftRight
            //},
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
        // <button class="flat-button mif-arrow-right mif-2x" onclick = "$('#canvasContainer').toggleClass('active')" > </button>
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
        // <div id="viewer_back" style="height: 360px; overflow-y: auto"></div>
        var divEditor = document.createElement("div");
        divEditor.id = "viewer_" + side + "_" + wrapperId;
        divEditor.style.height = "360px";
        divEditor.style.overflowY = "auto";

        // <div class="card-content p-2">
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
        // section
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
            // "viewer_" + side + "_" + wrapperId
            // markdown
            //var viewerFront = tui.Editor.factory({
            //    el: document.querySelector('#viewer_front_' + this.wrapperId),
            //    initialEditType: 'markdown',
            //    previewStyle: 'vertical',
            //    height: '400px',
            //    initialValue: data.front.content,
            //    viewer: true,
            //    exts: ['table', 'uml']
            //});
            //var viewerBack = tui.Editor.factory({
            //    el: document.querySelector('#viewer_back_' + this.wrapperId),
            //    initialEditType: 'markdown',
            //    previewStyle: 'vertical',
            //    height: '400px',
            //    initialValue: data.back.content,
            //    viewer: true,
            //    exts: ['table', 'uml']
            //});

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

            // button.classList.add('cdx-settings-button');
            // button.classList.toggle('cdx-settings-button--active', this.data[tune.name]);
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
                else { // stretch
                    this._toggleTune(tune.name);
                    //button.classList.toggle('cdx-settings-button--active');
                    button.classList.toggle(this.api.styles.settingsButtonActive);
                }
            });
        });

        return wrapper;
    }

    //render() {
    //    this.wrapper = document.createElement('div');
    //    if (this.data && this.data.data) {
    //        this.dataUri = this.data.data;
    //        this.prepare();
    //        return this.wrapper;
    //    }

    //    const inputDataUrl = document.createElement('input');
    //    inputDataUrl.classList.add('w-100');

    //    this.wrapper.appendChild(inputDataUrl);

    //    inputDataUrl.placeholder = 'Paste an data URL...';
    //    inputDataUrl.value = this.data && this.data.data ? this.data.data : "";

    //    inputDataUrl.addEventListener('paste', (event) => {
    //        this.dataUri = event.clipboardData.getData('text');
    //        this.prepare();
    //    });

    //    inputDataUrl.addEventListener('keyup', (event) => {
    //        if (event.keyCode === 13) {
    //            this.dataUri = inputDataUrl.value;
    //            this.prepare();
    //        }

    //    });

    //    return this.wrapper;
    //}

    prepare() {
        if (!this.dataUri) {
            return;
        }

        this.noteLink = LoreService.getUri_NoteLink(this.dataUri);
        this.authorLink = LoreService.getUri_Author_FromNoteLink(this.dataUri);
        var uriHash = CommonUtitlity.ComputeHash(this.dataUri);
        this.wrapperId = "divLoreSection_" + uriHash;
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

}

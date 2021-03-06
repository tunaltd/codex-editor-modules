/// <reference path="../../apps/LoreCard.ts" />
/// <reference path="./ModuleBase.ts" />

"use strict";
namespace FEF.Modules {
    export class LoreCard_List extends ModuleBase {

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
                    icon: KC.Tools.SVGConstants.SVG_Arrow_LeftRight
                },
                {
                    name: 'navNote',
                    title: 'Open Note',
                    icon: KC.Tools.SVGConstants.SVG_Arrow_Open_Blank
                },
                {
                    name: 'navAuthor',
                    title: 'Author',
                    icon: KC.Tools.SVGConstants.SVG_User_Info
                }
            ];
        }

        static get toolbox() {
            return {
                title: 'lore:> list',
                icon: KC.Tools.SVGConstants.SVG_Note_List
            };
        }

        createItem(containerUL: HTMLUListElement, title: string, description: string): HTMLLIElement {
            const liItem = document.createElement("li");
            //liItem.classList.add("step-list-item");

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

                // button.classList.add('cdx-settings-button');
                // button.classList.toggle('cdx-settings-button--active', this.data[tune.name]);
                button.classList.add(this.api.styles.settingsButton);
                button.classList.toggle(this.api.styles.settingsButtonActive, this.data[tune.name]);

                button.innerHTML = tune.icon;
                button.setAttribute("title", tune.title);
                wrapper.appendChild(button);

                button.addEventListener('click', () => {
                    if (tune.name === "navNote") {
                        KC.Tools.CommonUtitlity.OpenLink(this.noteLink);
                    }
                    else if (tune.name === "navAuthor") {
                        KC.Tools.CommonUtitlity.OpenLink(this.authorLink);
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

            this.noteLink = KC.Tools.LoreService.getUri_NoteLink(this.dataUri);
            this.authorLink = KC.Tools.LoreService.getUri_Author_FromNoteLink(this.dataUri);
            var uriHash = KC.Tools.CommonUtitlity.ComputeHash(this.dataUri);
            this.wrapperId = "divLoreList_" + uriHash;
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
}
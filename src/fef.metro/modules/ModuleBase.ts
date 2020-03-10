"use strict";
namespace FEF.Modules {
    export class ModuleBase {
        loreService: KC.Tools.LoreService;
        ModuleName: string;

        data: any;
        config: any;
        api: any;
        wrapper: any;
        settings: any;

        dataUri: string;
        wrapperId: string;

        authorLink: string;
        noteLink: string;

        constructor(moduleName) {
            this.loreService = LoreCard.inititialize();
            this.ModuleName = moduleName;
        }

        getDataUri(data) {
            var lines = data.match(/^.*((\r\n|\n|\r)|$)/gm);
            var dataUri = "";
            if (lines && lines.length > 0) {
                lines.forEach(element => {
                    //console.log(element); // ok
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
            //const input = blockContent.querySelector('input');
            // const inputDataUri = blockContent.querySelector('.data_uri');
            // var dataUri = inputDataUri.value;
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
}
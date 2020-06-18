
class KatexModule {
    constructor({ data, api }) {
        this.data = {
            text: data.text,
            //stretched: data.stretched !== undefined ? data.stretched : false
        };
        this.api = api;
        this.wrapper = undefined;
        // this.settings = [
        //     {
        //         name: 'stretched',
        //         title: 'Stretch',
        //         icon: `<svg width="17" height="10" viewBox="0 0 17 10" xmlns="http://www.w3.org/2000/svg"><path d="M13.568 5.925H4.056l1.703 1.703a1.125 1.125 0 0 1-1.59 1.591L.962 6.014A1.069 1.069 0 0 1 .588 4.26L4.38.469a1.069 1.069 0 0 1 1.512 1.511L4.084 3.787h9.606l-1.85-1.85a1.069 1.069 0 1 1 1.512-1.51l3.792 3.791a1.069 1.069 0 0 1-.475 1.788L13.514 9.16a1.125 1.125 0 0 1-1.59-1.591l1.644-1.644z"/></svg>`
        //     }
        // ];
    }

    static get toolbox() {
        return {
            title: 'KaTeX',
            icon: '<?xml version="1.0" encoding="utf-8"?><svg xmlns="http://www.w3.org/2000/svg" height="128" width="128" viewBox="0 0 128 128"><g><path id="path1" transform="rotate(0,64,64) translate(38.4394383430481,30) scale(2.125,2.125)" d="M1.8829951,0L21.440972,0 22.872979,0 22.872979,8.2990112 21.440972,8.2990112 21.440972,4.6640015 4.9149769,4.6640015 11.456967,14.273987 12.768001,16.198975 4.0129994,27.335999 22.10595,27.335999 22.62597,23.700989 24.057,23.700989 22.872979,32 21.440972,32 0,32 0,29.377991 9.2149628,17.577026 1.8829951,6.7720337 1.8829951,4.6640015 1.8829951,2.5230103z" /></g></svg>'
        };
    }

    // renderSettings() {
    //     const wrapper = document.createElement('div');

    //     this.settings.forEach(tune => {
    //         let button = document.createElement('div');

    //         // button.classList.add('cdx-settings-button');
    //         // button.classList.toggle('cdx-settings-button--active', this.data[tune.name]);
    //         button.classList.add(this.api.styles.settingsButton);
    //         button.classList.toggle(this.api.styles.settingsButtonActive, this.data[tune.name]);

    //         button.innerHTML = tune.icon;
    //         button.setAttribute("title", tune.title);
    //         wrapper.appendChild(button);

    //         button.addEventListener('click', () => {
    //             if(tune.name === "fullScreen"){
    //                 requestFullScreen(this.wrapper);
    //             } // fullScreen
    //             else{
    //                 this._toggleTune(tune.name);
    //                 //button.classList.toggle('cdx-settings-button--active');
    //                 button.classList.toggle(this.api.styles.settingsButtonActive);
    //             }
    //         });
    //     });

    //     return wrapper;
    // }

    render() {
        this.wrapper = document.createElement('div');
        this.wrapper.classList.add('katex-module');
        if (this.data && this.data.id && this.data.text) {
            this._renderKatex(this.data.id, this.data.text);
            return this.wrapper;
        }

        const inputId = "input_" + this.data.id;
        const inputDataText = document.createElement('textarea');
        inputDataText.setAttribute("id", inputId);
        inputDataText.setAttribute("data-role", "textarea")
        inputDataText.classList.add('w-100');
        inputDataText.placeholder = 'KaTeX text...';
        inputDataText.value = this.data && this.data.text ? this.data.text : "";

        inputDataText.addEventListener('paste', (event) => {
            //this._createImage(event.clipboardData.getData('text'));
            this.data.text = event.clipboardData.getData('text');
            //this.data.dataUri = inputDataUrl.value;
            //this._renderKatex();
        });
        // inputDataText.addEventListener('keyup', (event) => {
        //     if (event.keyCode === 13) {
        //         this.data.text = inputDataUrl.value;
        //         //this._renderKatex();
        //     }
        // });

        this.wrapper.appendChild(inputDataText);

        // ok button
        const spanCheckmark = document.createElement('span');
        spanCheckmark.className = "mif-checkmark";
        
        const okButton = document.createElement('button');
        okButton.className = "button info cycle outline";
        okButton.appendChild(spanCheckmark);
        okButton.addEventListener('click', (event) => {
            let tt = document.getElementById(inputId);
            this.data.text = tt.value;
            //this.data.dataUri = inputDataUrl.value;
            //this._renderKatex();
        });

        this.wrapper.appendChild(inputDataText);
        this.wrapper.appendChild(okButton);

        return this.wrapper;
    }

    // _toggleTune(tune) {
    //     this.data[tune] = !this.data[tune];
    //     this._acceptTuneView();
    // }

    // _acceptTuneView() {
    //     this.settings.forEach(tune => {
    //         this.wrapper.classList.toggle(tune.name, !!this.data[tune.name]);
    //         if (tune.name === 'stretched') {
    //             this.api.blocks.stretchBlock(this.api.blocks.getCurrentBlockIndex(), !!this.data.stretched);
    //             this._tryRefreshCyAfterResize();
    //         }
    //     });
    // }

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

    _generateId(){
        let now = new Date();
        let hash = this._computeHash(now.toUTCString());
        return hash;
    }

    _updateHtml(divId, html) {
        // core
        const divContainer = document.createElement('div');
        divContainer.setAttribute("id", divId);
        divContainer.setAttribute("style", "min-height: 50px; min-width: 500px;");
        divContainer.classList.add('w-100');
        divContainer.classList.add('h-100');
        divContainer.classList.add('text-center');
        //divContainer.classList.add('border');
        //divContainer.classList.add('bd-lightGray');

        divContainer.innerHTML = html;

        this.wrapper.innerHTML = '';
        this.wrapper.appendChild(divContainer);
    }

    _renderKatex(id, text) {
        if (!text) {
            return;
        }

        if(!id){
            id = this._generateId();
        }
        var divKatexId = "divKatex_" + id;
        let renderedHTML;

        try {
            if (!katex) {
                throw new Error('katex dependency required');
            }
            if (typeof options_katex === 'undefined') {
                options_katex = {
                    throwOnError: false
                };
            }
            renderedHTML = katex.renderToString(text, options_katex);
        } catch (err) {
            renderedHTML = `Error occurred on process katex: ${err.message}`;
        }

        this._updateHtml(divKatexId, renderedHTML);
    }

    save(blockContent) {
        let id = this.data.id;
        let text = this.data.text;

        this._renderKatex(id, text);

        return Object.assign(this.data, {
            id: id,
            text: text
        });
    }

    validate(savedData) {
        if (!savedData.text || !savedData.text.trim()) {
            return false;
        }
        return true;
    }

}
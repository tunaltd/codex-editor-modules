"use strict";

class ModuleBase {
    loreService: LoreService;
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

    createLinkButton_Note(noteLink) {
        const btnNote = document.createElement("a");
        btnNote.classList.add("button", "light", "ml-3");
        btnNote.style.lineHeight = "100%";
        btnNote.style.textDecoration = "none";
        btnNote.innerText = "Lore"; //data.title;
        btnNote.href = noteLink;
        btnNote.target = "_blank";
        return btnNote;
    }

    createLinkButton_Author(authorLink) {
        const btnAuthor = document.createElement("a");
        //<a class="button light" href="/{{author}}"><span class="mif-user"></span> {{author}}</a>
        btnAuthor.classList.add("button", "light", "ml-3");
        btnAuthor.style.lineHeight = "100%"; // overrite [.tui-editor-contents :not(table)] in https://uicdn.toast.com/tui-editor/latest/tui-editor-contents.min.css
        btnAuthor.style.textDecoration = "none"; // overrite [.tui-editor-contents a] in https://uicdn.toast.com/tui-editor/latest/tui-editor-contents.min.css
        btnAuthor.innerHTML = '<span class="mif-user"></span> ' + LoreService.getUserName_FromAuthorLink(authorLink);
        btnAuthor.href = authorLink;
        btnAuthor.target = "_blank";
        return btnAuthor;
    }

    createDiv_Settings(linkBtnNote, linkBtnAuthor) {
        const divSettings = document.createElement("div");
        divSettings.classList.add("mt-3", "d-flex", "flex-justify-center", "flex-align-center");
        if (linkBtnAuthor) {
            divSettings.appendChild(linkBtnAuthor);
        }
        if (linkBtnNote) {
            divSettings.appendChild(linkBtnNote);
        }
        return divSettings;
    }

}
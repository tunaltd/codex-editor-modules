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

}
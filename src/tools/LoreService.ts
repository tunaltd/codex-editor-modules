"use strict";

class LoreService {
    static uriPrefix: string = "https://lore.chuci.info/";
    static apiVersion: string = "v1";
    static apiUriPrefix: string = "https://lore.chuci.info/api/" + LoreService.apiVersion + "/";

    appId: string;
    appSecret: string;

    constructor(appId, appSecret) {
        this.appId = appId;
        this.appSecret = appSecret;
    }

    getNoteByURL(url: string, callback) {
        var uri = LoreService.getUri_Api_GetNote(url);
        $.ajax({
            url: uri,
            dataType: "json",
            type: "GET",
            // https://stackoverflow.com/questions/9870523/differences-in-application-json-and-application-x-www-form-urlencoded
            // https://stackoverflow.com/questions/21578814/how-to-receive-json-as-an-mvc-5-action-method-parameter
            contentType: 'application/x-www-form-urlencoded', // : 'application/json; charset=utf-8',
            // the HttpOnly make the two param invisible in client side script: account.id, account.password
            // data: "account.id=" + Cookies.get('account.id') + "&account.password=" + Cookies.get('account.password'),
            data: "appid=" + this.appId,// + "&account.password=" + Cookies.get('account.password'),
            async: true,
            processData: false,
            cache: false,
            crossDomain: true,
            success: function (data, textStatus, jqXHR) {
                //data = JSON.parse(jqXHR.responseText);
                if (typeof callback === "function") {
                    callback(data);
                    return;
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                var msgError = "¡¾Status¡¿" + textStatus + "¡¾error¡¿" + errorThrown + "¡¾others¡¿" + jqXHR.responseText;
                UIHelper.ShowError("ERROR", msgError);
            }
        });
    }

    getNote(author, domain, docId, callback) {
        var uri = "/api/" + LoreService.apiVersion + "/" + author + "/" + domain + "/" + docId;
        this.getNoteByURL(uri, callback);
    }


    static getUri_Api_GetNote(uri: string) {
        var apiUri = uri;
        if (uri.startsWith("https://localhost") && !uri.startsWith("https://localhost:44356/api")) {
            LoreService.apiUriPrefix = "https://localhost:44356/api/" + LoreService.apiVersion + "/";
            var uriPrefix_Localhost = "https://localhost:44356/";
            apiUri = LoreService.apiUriPrefix + uri.substring(uriPrefix_Localhost.length);
        }
        // url of detail view page
        // https://lore.chuci.info/taurenshaman/mind/b87789af835a4c58b506084415d3ad5f
        else if (uri.startsWith("https://lore.chuci.info") && !uri.startsWith("https://lore.chuci.info/api")) {
            LoreService.apiUriPrefix = "https://lore.chuci.info/api/" + LoreService.apiVersion + "/";
            apiUri = LoreService.apiUriPrefix + uri.substring(LoreService.uriPrefix.length);
        }
        return apiUri;
    }

    static getUri_NoteLink(uri: string) {
        var link = uri;
        var apiString = "/api/" + LoreService.apiVersion;
        if (uri.indexOf(apiString) >= 0) {
            link = uri.replace(apiString, "");
        }
        return link;
    }

    static getUri_Author_FromNoteLink(noteLink: string) {
        var tmpPrefix = LoreService.uriPrefix;
        if (noteLink.startsWith("https://localhost")) {
            tmpPrefix = "https://localhost:44356/";
        }

        // https://localhost:44356/jerin/mind/f21703588cca4cea96f8931442e3df22
        var link = noteLink.substring(tmpPrefix.length); // 32+1+4+1=38
        var index = link.indexOf("/");
        var authorName = link.substring(0, index);
        return tmpPrefix + authorName;
    }

    static getUserName_FromAuthorLink(authorLink: string) {
        var index = authorLink.lastIndexOf("/");
        var name = authorLink.substring(index + 1);
        return name;
    }


    static fitDialog(json): any {
        var agents = json.agents;
        _.forEach(json.items, (item) => {
            var agentId = item.agentId;
            var agent = _.find(agents, function (o) { return o.id === agentId; });
            item.name = agent.name;
            item.avatar = "https://robohash.org/" + agentId + ".png"; //Utility.generateAvatarByName_Robot("", agent.name);
            item.time = new Date(item.time)
        });
        return json.items;
    }

}
/// <reference path="../tools/LoreService.ts" />

"use strict";

class LoreCard {
    static api: KC.Tools.LoreService;

    static inititialize(): KC.Tools.LoreService {
        if (typeof LoreCard.api === "undefined") {
            LoreCard.initService("", "");
        }
        return LoreCard.api;
    }

    static initService(appId, appSecret): KC.Tools.LoreService {
        LoreCard.api = new KC.Tools.LoreService(appId, appSecret);
        return LoreCard.api;
    }

}
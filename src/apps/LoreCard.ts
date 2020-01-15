/// <reference path="../tools/LoreService.ts" />

"use strict";

class LoreCard {
    static api: LoreService;

    static inititialize(): LoreService {
        if (typeof LoreCard.api === "undefined") {
            LoreCard.initService("", "");
        }
        return LoreCard.api;
    }

    static initService(appId, appSecret): LoreService {
        LoreCard.api = new LoreService(appId, appSecret);
        return LoreCard.api;
    }

}
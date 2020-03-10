"use strict";
//import KCModels = KC.Models;
namespace FEF.Tools {
    export class UIHelper {

        public static ShowCharm(id) {
            var charm = $("#" + id).data("charms");
            charm.open();
        }

        public static HideCharm(id) {
            var charm = $("#" + id).data("charms");
            charm.close();
        }

        public static ShowOrHideCharm(id, canClose) {
            var charm = $("#" + id).data("charms");
            if (charm.element.data("opened") === true && canClose === true) {
                charm.close();
            } else {
                charm.open();
            }
        }

        public static disableElement(id) {
            $("#" + id).attr('disabled', "true");
        }

        public static enableElement(id) {
            $("#" + id).attr('disabled', "false");
        }

        public static ShowMessage(title, message) {
            Metro.notify.create(message, title, {
                cls: "info"
            });
        }

        public static ShowError(title, error) {
            Metro.notify.create(error, title, {
                cls: "alert"
            });
        }

        public static ToastError(msg) {
            var toast = Metro.toast.create;
            toast(msg, null, 5000, "bg-red fg-white");
        }

        public static ToastMessage(msg) {
            var toast = Metro.toast.create;
            toast(msg, null, 5000, "bg-green fg-white");
        }

        public static LaunchFullScreen(element) {
            if (element.requestFullscreen) {
                element.requestFullscreen();
            } else if (element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
            } else if (element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen();
            } else if (element.msRequestFullscreen) {
                element.msRequestFullscreen();
            }
        }

        public static SetupFullScreen(element, callbackFullScreenChange) {
            if (element.addEventListener) { // listen to exitFullScreen
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

        public static getIcon(noteType: string): string {
            var icon = "mif-embed2";
            switch (noteType) {
                case KC.Models.ModelData.Type_Document:
                    icon = 'mif-file-code';
                    break;
                case KC.Models.ModelData.Type_Mind:
                    icon = 'mif-share';
                    break;
                case KC.Models.ModelData.Type_Section:
                    icon = 'mif-book-reference';
                    break;
                case KC.Models.ModelData.Type_Dialog:
                    icon = 'mif-chat-bubble-outline';
                    break;
                case KC.Models.ModelData.Type_XY:
                    icon = 'mif-windows';
                    break;
                case KC.Models.ModelData.Type_5W2H1E:
                    icon = 'mif-dashboard';
                    break;

                case KC.Models.ModelData.Type_Topic:
                    icon = 'mif-folder-special2';
                    break;
                case KC.Models.ModelData.Type_LanguagePack:
                    icon = 'mif-language';
                    break;
                case KC.Models.ModelData.ItemType_vocabulary:
                    icon = 'mif-language';
                    break;

                default:
                    icon = 'mif-embed2';
                    break;
            }
            return icon;
        }

    }
}
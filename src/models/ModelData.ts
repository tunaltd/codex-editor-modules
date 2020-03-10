"use strict";
namespace KC.Models {
    export class ModelData {
        public static Type_Document: string = "document"; // 普通的（结构化数据）文档
        public static Type_Article: string = "article"; // 文章
        public static Type_Couplet: string = "couplet"; // 楹联
        public static Type_Dialog: string = "dialog"; // 对话
        public static Type_Section: string = "section"; // 文本片段，摘抄
        public static Type_List: string = "list";
        public static Type_Tree: string = "tree";
        // 分析
        public static Type_Mind: string = "mind"; // 头脑风暴
        public static Type_XY: string = "xy"; // 四象限分析
        public static Type_5W2H1E: string = "5w2h1e"; // 5W2H1E分析
        // 学习复习
        public static Type_Topic: string = "topic";
        public static Type_LanguagePack: string = "language-pack"; // 语言卡片包
        public static Type_MathPack: string = "math-pack"; // 数学卡片包
        public static Type_HistoryPack: string = "history-pack"; // 语言卡片包

        public static ItemType_vocabulary: string = "language:vocabulary"; // 词汇
        //public static ItemType_vocabulary_word: string = "language:vocabulary:word"; // 单词
    }
}
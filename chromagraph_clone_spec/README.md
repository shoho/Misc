# Chromagraph クローン 技術仕様

Chromagraph Camera と同じ思想、すなわち「Apple の画像処理の上にフィルターを重ねるのではなく、センサー RAW から独自に画を構築する」カメラアプリを iOS で作るための技術仕様です。

- 本文: [SPEC.md](./SPEC.md)
- 前提となる調査: [../chromagraph_camera_research/](../chromagraph_camera_research/)

Chromagraph Camera の内部実装は非公開です。本仕様は公開情報と iOS の公開 API から「こう作るのが筋が良い」と判断した設計であり、本家の実装と一致する保証はありません。

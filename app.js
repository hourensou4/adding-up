//ファイルからデータを読み取る部分
'use strict';
//Node.js に用意されたモジュールを呼び出し
const fs = require('node:fs');
const readline = require('node:readline');
//ファイルを読み込む Stream（ストリーム）を生成
const rs = fs.createReadStream('./popu-pref.csv');
const rl = readline.createInterface({ input: rs });
const prefectureDataMap = new Map(); // key: 都道府県 value: 集計データのオブジェクト
//ファイルを読み込んだときの処理  
//rl オブジェクトで line というイベントが発生したら この無名関数を呼んでください、という意味
rl.on('line', lineString => {
  //引数 lineString で与えられた文字列をカンマ , で分割して、それを columns という名前の配列にしています
  const columns = lineString.split(',');
  //配列 columns の要素へ並び順の番号でアクセスして、集計年（0 番目）,都道府県（1 番目）,15〜19 歳の人口（3 番目）をそれぞれ変数に保存
  const year = parseInt(columns[0]);
  const prefecture = columns[1];
  const popu = parseInt(columns[3]);
  if (year === 2016 || year === 2021) {
    let value = null;
    if (prefectureDataMap.has(prefecture)) {
      value = prefectureDataMap.get(prefecture);
    } else {
      value = {
        before: 0,
        after: 0,
        change: null
      };
    }
    if (year === 2016) {
      value.before = popu;
    }
    if (year === 2021) {
      value.after = popu;
    }
    prefectureDataMap.set(prefecture, value);
    //連想配列へ格納したので、次から同じ県のデータが来ればvalue = prefectureDataMap.get(prefecture);のところで、保存したオブジェクトが取得されることになります。
  }
});
//'close' イベントは、全ての行を読み込み終わった際に呼び出されます
rl.on('close', () => {
  for (const [key, value] of prefectureDataMap) {
    value.change = value.after / value.before;
  }
  const rankingArray = Array.from(prefectureDataMap).sort((pair1, pair2) => {
    return pair2[1].change - pair1[1].change;
  });
  const rankingStrings = rankingArray.map(([key, value]) => {
    return `${key}: ${value.before}=>${value.after} 変化率: ${value.change}`;
  });
  console.log(rankingStrings);
});
/*for-of 構文では、都道府県ごとに次の処理をしています。
変数 value を宣言し、都道府県の集計データオブジェクトを代入
オブジェクトのプロパティを変更： value.change = value.after / value.before;
変数 value を削除*/

//Array.from(prefectureDataMap) の部分で、連想配列を普通の配列に変換する処理
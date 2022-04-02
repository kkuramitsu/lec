// GET のデータを配列にして返す
function GetQueryString() {
    var result = {};
    if (1 < window.location.search.length) {
        var query = window.location.search.substring(1);
        var parameters = query.split('&');
        for (var i = 0; i < parameters.length; i++) {
            var element = parameters[i].split('=');
            var paramName = decodeURIComponent(element[0]);
            var paramValue = decodeURIComponent(element[1]);
            result[paramName] = paramValue;
        }
    }
    return result;
}

window.onload = function () {
    const query = GetQueryString();
    if (query["uid"]) {
        atcoder_id.value = query["uid"];
    }

    // 問題一覧を表示
    var cells = {
    }

    function tail(ss) {
        return ss[ss.length - 1];
    }

    function count(d, key, n) {
        if (key in d) {
            d[key] += n;
        }
        else {
            d[key] = n;
        }
    }

    var unit_count = -1;
    var problem_count = 0;
    for (var i = 0; i < problems.length; i++) {
        if (problems[i].length == 1) continue;
        var title = problems[i][0];
        var url = problems[i][1]; // url
        var html_th, html_td, problem_id = undefined;
        if (!url.startsWith('http')) {
            unit_count += 1;
            problem_count = 0;
            html_th = `${unit_count}`
            html_td = `<b>${title}</b>`;
        }
        else {
            problem_id = tail(url.split('/'));
            problem_count += 1;
            html_th = `${unit_count}-${problem_count}`;
            html_td = `<a href="${url}" target="atcoder">${title}</a> (${problem_id})`;
        }
        var tr = problem_tbody.insertRow(-1);
        var th = document.createElement("th");
        th.innerHTML = html_th;
        th.scope = "row";
        tr.appendChild(th);
        var td1 = tr.insertCell(-1);
        td1.innerHTML = html_td;
        var td2 = tr.insertCell(-1);
        td2.innerHTML = '';
        if (problem_id !== undefined) {
            var td3 = tr.insertCell(-1);
            cells[problem_id] = td3;
        }
    }

    // 提出状況を表示
    if (atcoder_id.value !== '') {
        const uid = atcoder_id.value
        var url = "https://kenkoooo.com/atcoder/atcoder-api/results?user=" + uid;
        fetch(url).then(function (response) {
            response.text().then(function (text) {
                const data = JSON.parse(text);
                var AC = 0, AC2=0, ModAC=0;
                var score = {};
                var epoch = [];
                var extra = '';
                data.sort((x,y) => x.epoch_second - y.epoch_second);
                for (var i = 0; i < data.length; i += 1) {
                    var problem_id = data[i].problem_id;
                    if (data[i].epoch_second > 1648771200) {
                        epoch.push(data[i].epoch_second);
                    }
                    else{
                        continue;
                    }
                    //https://atcoder.jp/contests/abc029/submissions/21458111
                    var contest_id = data[i].contest_id;
                    var url = `https://atcoder.jp/contests/${contest_id}/submissions/${data[i].id}`
                    if (problem_id in cells) {
                        var s = '';
                        if (data[i].result == 'AC') {
                            s = `<span class="label-ac">AC</span>`;
                            if (!(problem_id in score)) {
                                AC += 1;
                            }
                            count(score, problem_id, 1);
                        }
                        else if (data[i].result == 'TLE') {
                            s = '<span class="label-mod">TLE</span>';
                        }
                        else {
                            s = '<span class="label-wa">' + data[i].result + '</span>';
                        }
                        cells[problem_id].innerHTML += `<a href="${url}" target="atcoder_result">${s}</a> `;
                    }
                    else {
                        if (data[i].result == 'AC') {
                            if (!(problem_id in score)) {
                                AC2 += 1;
                            }
                            count(score, problem_id, 1);
                            extra += `<a href="${url}" target="atcoder_result">${problem_id}</a> `;
                        }
                    }
                }
                //
                epoch.sort();
                //console.log(epoch);
                var time = 0;
                for (var i = 1; i < epoch.length; i += 1) {
                    time += Math.min(epoch[i] - epoch[i - 1], 45 * 60);
                }
                time = (((time * 100) / 3600) | 0) / 100
                //
                var element = document.getElementById('results');
                element.innerHTML = `<span class="label-ac">正解数</span> ${AC} + ${AC2}`
                    + ` <span class="label-wa">時間(おおよそ)</span> ${time}`;
                // element = document.getElementById('extra');
                // element.innerHTML = extra;
                });
        });
    }
}



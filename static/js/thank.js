function init(){
    
    let requestURL = "http://52.76.36.230:3000/api/user";
    let request = new XMLHttpRequest();
    request.onload = function(){
        if (request.status >= 200){
            let json = JSON.parse(request.responseText);
            if(json.data){

                let button = document.querySelector("#signin");
                button.removeAttribute("onclick");
                button.addEventListener("click", signOut, true);
                let text = document.createTextNode("歡迎光臨 / 登出");
                button.removeChild(button.childNodes[0]);
                button.appendChild(text); 

                let username = document.querySelector("#orderuser");
                let username_text = document.createTextNode(json.data.name);
                username.appendChild(username_text);

                getOrder();

            }else if(json.data == null){
                alert("請先登入");
                window.location.href="http://52.76.36.230:3000/";
            }
        };
    };
    request.open("GET" , requestURL , true);
    request.setRequestHeader('content-type', 'application/json');
    request.send();
    
}

function getOrder(){
    let requestURL = "http://52.76.36.230:3000/api/orders";
    let request = new XMLHttpRequest();
    request.onload = function(){
        if(request.status == 200){
            let json = JSON.parse(request.responseText);
            if(json.data != null){
                json.data.forEach( ele => {
                    createOrder(ele.number, ele.price, ele.status, ele.trip);            
                });
            }else if(json.data == []){
                let Norder = document.querySelector("body > div.Norder");
                Norder.style.display="block";
            }
        }else if(request.status >= 400){
            alert("請先登入");
            window.location.href="http://52.76.36.230:3000/";
        }
    };
    request.open("GET" ,requestURL ,true);
    request.setRequestHeader('content-type', 'application/json');
    request.send();
};   

function createOrder(paynumber, price, status, attraction){
    let coverpaybox = document.createElement("div");
    coverpaybox.className = "coverpaybox";

    let paystatus = document.createElement("div");
    paystatus.className = "paystatus";

    let index = document.createElement("div");
    let index_text = document.createTextNode("編號：");
    index.appendChild(index_text);
    
    let paynumber_div = document.createElement("div");
    paynumber_div.id = "paynumber";
    paynumber_div.style.color = "blue";
    let paynumber_text = document.createTextNode(paynumber)
    paynumber_div.appendChild(paynumber_text);
    
    let price_div = document.createElement("div");
    price_div.id = "price";
    let price_text = document.createTextNode("新台幣" + price);
    price_div.appendChild(price_text);

    let payornot_div = document.createElement("div");
    payornot_div.id = "payornot";
    if(status == "1"){
        payornot_div.style.color = "blue";
        let payornot_text = document.createTextNode("已付款");
        payornot_div.appendChild(payornot_text);
    }else if(status == "0"){
        payornot_div.style.color = "red";
        let payornot_text = document.createTextNode("未付款");
        payornot_div.appendChild(payornot_text);
    }
    
    paystatus.appendChild(index);
    paystatus.appendChild(paynumber_div);
    paystatus.appendChild(price_div);
    paystatus.appendChild(payornot_div);
    coverpaybox.appendChild(paystatus);

    attraction.forEach( ele => {
        let orderbox = createOrderBox(ele.attraction.image, ele.attraction.name, ele.date, ele.time, ele.attraction.address);
        coverpaybox.appendChild(orderbox);
    });

    let body = document.body;
    let position = document.querySelector("body > hr");
    body.insertBefore(coverpaybox, position);
};

function createOrderBox(image_url, name, date, time, address){
    let orderbox = document.createElement("div");
    orderbox.className="orderbox";

    let orderImgBox = document.createElement("div");
    orderImgBox.className = "orderimg";
    let orderImg = document.createElement("img");
    orderImg.src=image_url;
    orderImgBox.appendChild(orderImg);
    orderbox.appendChild(orderImgBox);

    let orderinfo = document.createElement("div");
    orderinfo.className="orderinfo";

    let ordertitle = document.createElement("div");
    ordertitle.id="title";
    let title = document.createTextNode("台北一日遊:"+name);
    ordertitle.appendChild(title);
    orderinfo.appendChild(ordertitle);
    orderinfo.appendChild(createDiv("日期：", date));
    orderinfo.appendChild(createDiv("時間：", time));
    orderinfo.appendChild(createDiv("地點：", address));
    orderbox.appendChild(orderinfo);

    return orderbox;
}

function createDiv(text, detail){
    let div = document.createElement("div");
    div.id="info";
    let textnode = document.createTextNode(text);
    div.appendChild(textnode);
    let span = document.createElement("span");
    span.id="detail";
    let detail_text = document.createTextNode(detail);
    span.appendChild(detail_text);
    div.appendChild(span);

    return div;
}

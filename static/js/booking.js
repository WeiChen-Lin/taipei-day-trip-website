function init(){
    
    let requestURL = "https://wcl-travel.com/api/user";
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

                getBooking();
                let username = document.querySelector("#orderuser");
                let username_text = document.createTextNode(json.data.name);
                username.appendChild(username_text);

                let title = document.querySelector("body > div.Upperlayer > div.title");
                title.addEventListener("click", () => {
                    window.location.href="https://wcl-travel.com/";
                })
                
                let trip = document.querySelector("#order");
                trip.style.display ="none";

                let order = document.querySelector("#orderlist");
                order.style.display = "block";
                order.addEventListener("click", () => {
                    window.location.href="https://wcl-travel.com/thankyou";
                })
        
            }else if(json.data == null){
                alert("請先登入");
                window.location.href="https://wcl-travel.com/";
            }
        };
    };
    request.open("GET" , requestURL , true);
    request.setRequestHeader('content-type', 'application/json');
    request.send();
    
}

function getBooking(){
    let requestURL = "https://wcl-travel.com/api/booking";
    let request = new XMLHttpRequest();
    request.onload = function(){
        if (request.status == 200){
            let json = JSON.parse(request.responseText);
            if(json.data != null){
                json.data.forEach( attr => { 
                    if(attr.time == "Morning"){
                        let time = "早上九點到下午四點";
                        createBooking(attr.attraction.id, attr.attraction.name, attr.date, time, attr.price, attr.attraction.address, attr.attraction.image, attr.time);
                    }else if(attr.time == "Afternoon"){
                        let time = "下午兩點到晚上九點";
                        createBooking(attr.attraction.id, attr.attraction.name, attr.date, time, attr.price, attr.attraction.address, attr.attraction.image, attr.time);
                    }
                let pay= document.querySelector("body > form");
                pay.style.display="block";
                });
            }else{
                let Norder = document.querySelector("body > div.Norder");
                Norder.style.display="block";
            }
        };
    };
    request.open("GET" , requestURL , true);
    request.setRequestHeader('content-type', 'application/json');
    request.send();
}   

function createBooking(id, name, date, time, price, address, image_url, attr_time){
    let orderbox = document.createElement("div");
    orderbox.className="orderbox";

    let deleteImg = document.createElement("img");
    deleteImg.className="deleteOrder";
    deleteImg.src=delete_img_path;
    orderbox.appendChild(deleteImg);
    deleteImg.addEventListener("click" , () => {
        DeleteOrder(id, date, attr_time);
    })

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
    orderinfo.appendChild(createDiv("時間：", time));    orderinfo.appendChild(createDiv("價錢：", "新台幣 " + price + " 元"));
    orderinfo.appendChild(createDiv("地點：", address));
    orderbox.appendChild(orderinfo);

    let body = document.body;
    let position = document.querySelector("body > hr");
    body.insertBefore(orderbox,position);
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

function DeleteOrder(attraction_id, date, time){
    let requestURL = "https://wcl-travel.com/api/booking";
    let request = new XMLHttpRequest();
    let data = {}
    data.attraction_id = attraction_id;
    data.date = date;
    data.time = time;
    let data_to_python = JSON.stringify(data);
    request.onload = function(){
        if(request.status == 200){
            window.location = window.location;
        };
    }
    request.open("DELETE" , requestURL , true);
    request.setRequestHeader('content-type', 'application/json');
    request.send(data_to_python);
}


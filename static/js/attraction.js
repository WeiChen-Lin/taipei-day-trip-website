let counter = 0;
let img_list;
let img_length = 0;

function TextIn( region , text){
    let input_text = document.createTextNode(text);
    region.appendChild(input_text);
};

function init(){
    signCheck();
    BookingPage();

    let title = document.querySelector("body > div.Upperlayer > div.title");
    title.addEventListener("click", () => {
        window.location.href="http://52.76.36.230:3000/";
    })
    
    var requestURL = "http://52.76.36.230:3000/api/attraction/" + id;
    var request = new XMLHttpRequest();

    request.onload = function () {
        
        if (request.status >= 200 && request.status < 400) {
        
            let json = JSON.parse(request.responseText);
            data = json.data;
            let view_name = document.querySelector("#view_name");
            let view_cate = document.querySelector("#view_cate");
            let view_text = document.querySelector("#text");
            let view_address = document.querySelector("#address");
            let view_trans = document.querySelector("#traffic")
            img_list = data.images;
            img_length = img_list.length;
            TextIn(view_name , data.name);
            let cate = data.category + " at " + data.mrt;
            TextIn(view_cate , cate);
            TextIn(view_text , data.description);
            TextIn(view_address , data.address)
            TextIn(view_trans , data.transport);
            
            ImageChange(img_list);
        }else{
            console.log("something wrong");
        };
    };

    request.open("get" , requestURL , true);
    request.send();
}

function Price(but){
    let price_bar = document.querySelector("#check_money");
    let span_region = document.createElement("span");
    span_region.id = "money";

    let input_not_selected = document.querySelectorAll("#check_time input");
    input_not_selected.forEach(ele => ele.classList.remove("priceSelectclick"));

    if(but.id == "upperday"){
        let span_check = document.querySelector("#money"); 
        if(span_check){
            price_bar.removeChild(span_check);
        };
        price_bar.appendChild(span_region);
        let money = document.createTextNode("新臺幣2000元");
        span_region.appendChild(money);
        but.classList.add("priceSelectclick")
    }else{
        let span_check = document.querySelector("#money"); 
        if(span_check){
            price_bar.removeChild(span_check);
        };
        price_bar.appendChild(span_region);
        let money = document.createTextNode("新臺幣2500元");
        span_region.appendChild(money);
        but.classList.add("priceSelectclick")
    }
};

function createImgArea(url){
    let view = document.querySelector(".view");
    let prev = document.querySelector("#prev");
    let img_create = document.createElement("img");
    img_create.src = url;
    img_create.id = "player";
    img_create.className = "show";
    view.insertBefore(img_create , prev);
};

function createImgBox(img_length){
    let Img_select = document.createElement("div");
    Img_select.className = "Img_select";
    
    for(let i = 0; i < img_length ; i++){
        let but = document.createElement("button");
        but.id = "pic";
        Img_select.appendChild(but);
    };

    let view = document.querySelector(".view");
    view.appendChild(Img_select);
};

function ImageChange(img_list){
    // 創建img標籤裝景點
    img_list.forEach(item => createImgArea(item));
    
    console.log(img_length);
    
    createImgBox(img_length);

    showCurrentImage();
};

function showCurrentImage(){
    let target_img = Math.abs(counter % img_list.length);
    items = document.querySelectorAll('#player');
    items.forEach(item => item.classList.remove("show"));
    items[target_img].className = "show";
    
    item_direc = document.querySelectorAll("#pic");
    item_direc.forEach(item => item.classList.remove("pic_now"));
    item_direc[target_img].className = "pic_now";
};

function showPrev(){
    counter--;
    showCurrentImage();
};

function showNext(){
    counter++;
    showCurrentImage();
};

function getBooking(){
    let return_data = {}
    let price = document.querySelector("#money");
    let date = document.querySelector("#check_date > input[type=date]");
    return_data.attractionId = id;
    
    if(date.value){
        return_data.date = date.value;
    }else if(date.value == ""){
        alert("貼心提醒，日期及時段都要選擇方便服務人員確認喔");
        return false;
    }

    if(price){
        if(price.textContent == "新臺幣2000元"){
            return_data.time = "Morning"
            return_data.price = 2000;
        }else if(price.textContent == "新臺幣2500元"){
            return_data.time = "Afternoon";
            return_data.price = 2500;
        }
    }else if(price == null){
        alert("貼心提醒，日期及時段都要選擇方便服務人員確認喔OuO");
        return false;
    }

    return return_data;
    
}

function SendBooking(){
    let requestURL = "http://52.76.36.230:3000/api/booking";
    let request = new XMLHttpRequest();
    let data = getBooking();
    if(data){
        let data_to_python = JSON.stringify(data);
        request.onload = function(){
            if (request.status == 200){
                alert("行程已預定");
            }else if(request.status >= 400){
                let json = JSON.parse(request.responseText);
                alert(json.message);
            };
        };
        request.open("POST" , requestURL , true);
        request.setRequestHeader('content-type', 'application/json');
        request.send(data_to_python);
    };
};



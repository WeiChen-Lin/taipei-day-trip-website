var counter = 0;
var img_list;
var img_length = 0;

function TextIn( region , text){
    let input_text = document.createTextNode(text);
    region.appendChild(input_text);
};

function init(){
    signCheck();

    var requestURL = "http://52.76.36.230:3000/api/attraction/" + id;
    var request = new XMLHttpRequest();

    request.onload = function () {
        
        if (request.status >= 200 && request.status < 400) {
        
            let json = JSON.parse(request.responseText);
            data = json.data[0];
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
    
    if(but.id == "upperday"){
        let span_check = document.querySelector("#money"); 
        if(span_check){
            price_bar.removeChild(span_check);
        };
        price_bar.appendChild(span_region);
        let money = document.createTextNode("新臺幣2000元");
        span_region.appendChild(money);
    }else{
        let span_check = document.querySelector("#money"); 
        if(span_check){
            price_bar.removeChild(span_check);
        };
        price_bar.appendChild(span_region);
        let money = document.createTextNode("新臺幣2500元");
        span_region.appendChild(money);
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


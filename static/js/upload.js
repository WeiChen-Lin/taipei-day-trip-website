function view(){
    let but = document.querySelector("body > div > div.uploadimg > div.imgbutton > input[type=file]");
    but.addEventListener("change", () => {
        let file = but.files[0];
        let img_site = document.querySelector("body > div > div.uploadimg > div.view > div.viewimg > img");
        let read = new FileReader();
        read.readAsDataURL(file);
        read.onload = function(e){
           img_site.src = this.result;
        }
    })
};

function submitfile(){
    let text = document.querySelector("body > div.upload > div.uploadtext > textarea").value;
    let file = document.querySelector("body > div > div.uploadimg > div.imgbutton > input[type=file]");
    let data = new FormData();
    let time = Date.now()
    data.append(file.name, file.files[0]);
    data.append("time", time);
    data.append("text", text)
    let requestURL = "https://wcl-travel.com/api/uploads";
    let request = new XMLHttpRequest();
    request.onload = function(){
        let json = JSON.parse(request.responseText);
        let data = json.data;
        if(data != null){
            createMode(data.date, data.url, data.mode);
        };
        let text_area = document.querySelector("body > div.upload > div.uploadtext > textarea");
        text_area.value='';
        file.value='';
        let img_site = document.querySelector("body > div > div.uploadimg > div.view > div.viewimg > img");
        img_site.src='';
    };
    request.open("POST" ,requestURL ,true);
    request.send(data);
}

function createMode(date, src, text){
    let mode_position = document.createElement("div");
    mode_position.className = "mode";

    let date_area = document.createElement("div");
    date_area.className = "date";
    console.log(date, typeof(date), parseInt(date));
    let date_toInt = parseInt(date)
    let date_to = new Date(date_toInt);
    let date_text = document.createTextNode(date_to.getFullYear() + "-" + (date_to.getMonth() + 1) + "-" + date_to.getDate());
    date_area.appendChild(date_text);

    let img_site = document.createElement("div");
    img_site.className = "img";
    let img = document.createElement("img");
    img.src = src;
    img_site.appendChild(img);

    let text_site = document.createElement("div");
    text_site.className = "message";
    let text_string = document.createTextNode(text);
    text_site.appendChild(text_string)

    mode_position.appendChild(date_area);
    mode_position.appendChild(img_site);
    mode_position.appendChild(text_site);

    let diarary = document.querySelector("body > div.diarary");
    diarary.appendChild(mode_position);
}

view();

let but = document.querySelector("body > div.upload > div.uploadimg > div.submitbut > button");
but.addEventListener("click", submitfile);

function init(){
    let requestURL = "https://wcl-travel.com/api/uploads";
    let request = new XMLHttpRequest();
    request.onload = function(){
        let json = JSON.parse(request.responseText);
        json.data.forEach(ele => {
            createMode(ele.date, ele.url, ele.mode)
        });
    };
    request.open("GET" , requestURL, true);
    request.send();
}
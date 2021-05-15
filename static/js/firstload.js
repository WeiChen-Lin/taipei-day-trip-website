var nextPage = 0;
var keyword = "";
var check_load = null;


function createContent(){
    let content = document.createElement("div");
    content.className="content";
    let content_position = document.getElementsByClassName("loading")[0];
    body_ele = document.body;
    body_ele.insertBefore(content , content_position);
};

function TextInDiv(div_id , div_text){
    let return_div = document.createElement("div");
    return_div.setAttribute('id', div_id );
    let input_text = document.createTextNode(div_text);
    return_div.appendChild(input_text);

    return return_div
};

function createAttrBox(img , attr_name , attr_MRT , attr_category , id){
    let attr_box = document.createElement("div");
    attr_box.className = "attr_box";

    let attr_img = document.createElement("div")
    attr_img.className = "attr_img";

    let img_url = document.createElement("img");
    img_url.src = img;

    let img_text = TextInDiv("img_text" , attr_name);

    attr_img.appendChild(img_url);
    attr_img.appendChild(img_text);

    let attr_text = document.createElement("div");
    attr_text.className = "attr_text";

    let MRT = TextInDiv("MRT" , attr_MRT);
    let category = TextInDiv("category" , attr_category);
    
    attr_text.appendChild(MRT);
    attr_text.appendChild(category);

    attr_box.appendChild(attr_img);
    attr_box.appendChild(attr_text);

    let content = document.getElementsByClassName("content")[0];
    content.appendChild(attr_box);
    
    attr_box.addEventListener("click" , () => {
        window.open("http://52.76.36.230:3000/attraction/"+id);
    } );
};

function init(){
    signCheck();

    var requestURL = "http://52.76.36.230:3000/api/attractions?page=0";
    var request = new XMLHttpRequest();

    request.onload = function () {
        
        if (request.status >= 200 && request.status < 400) {
            var json = JSON.parse(request.responseText);
            data = json.data;
            createContent();
            for(let i = 0; i < data.length ; i++){
                createAttrBox(data[i].images[0] , data[i].name , data[i].mrt , data[i].category , data[i].id);
            }; 
            nextPage = json.nextPage;
            if(nextPage){
                check_load = 1;
            }else(
                check_load = null
            );
        }else{
            console.log("something wrong");
        };
    };

    request.open("get" , requestURL , true);
    request.send();

    
};

function Token_verify(){
    let requestURL = "http://52.76.36.230:3000/api/user";
    let request = new XMLHttpRequest();
    request.onload = function(){
        alert("登入成功!");
    }
    request.open("get" , requestURL , true);
    request.send();
}

function loadPage(nextPage , keyword){
    if(nextPage != null){
        var requestURL = "http://52.76.36.230:3000/api/attractions?page=" + nextPage + "&keyword=" + keyword;
        var request = new XMLHttpRequest();

        request.onload = function () {    
            if (request.status >= 200 && request.status < 400) {
                var json = JSON.parse(request.responseText);
                data = json.data;
                createContent();
                for(let i = 0; i < data.length ; i++){
                    createAttrBox(data[i].images[0] , data[i].name , data[i].mrt , data[i].category);
                }; 
                nextPage = json.nextPage;
                if(nextPage){
                    check_load = 1;
                }else(
                    check_load = null
                );
            }else{
                console.log("something wrong");
            };
        };

        request.open("get" , requestURL , true);
        request.send();
    }else{
        console.log("到底了");
    }
};

function loading_image(){
    let loading_img = document.querySelector("#load_img");
    loading_img.style.display = "block";
};

let footer = document.querySelector("div.footer");
options = {
    rootMargin:"30px",
    threshold:[0]
}

let zxxObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
        if (entry.isIntersecting && check_load == 1) {
            loadPage(nextPage , keyword);
            nextPage += 1;    
        }
    });
} , options);

zxxObserver.observe(footer);


function getform(position){
    let form = new FormData(position);
    let obj = {};
    for (let key of form.keys() ) {
		obj[key] = form.get(key);
	}
	return obj;
};

function SearchAttr(){
    let btn = document.querySelector("#search_icon");
    window.addEventListener("submit" , function(btn){
        btn.preventDefault();
    });

    let position = document.querySelector("#search_box");
    let obj = getform(position);
    console.log(obj);

    let old_content = document.getElementsByClassName("content");
    for(let i = 0 ; i < old_content.length ; i++){
        document.body.removeChild(old_content[i]);
    };
    
    check_load = null;
    
    keyword = obj.input_keyword;
    loadPage( 0 , keyword);
    
    return false;
};



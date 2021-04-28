function createContent(){
    let content = document.createElement("div");
    content.className="content";
    let content_position = document.getElementsByClassName("footer")[0];
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

function createAttrBox(img , attr_name , attr_MRT , attr_category){
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
};

function init(){
    var requestURL = "http://52.76.36.230:3000/api/attractions?page=0";
    var request = new XMLHttpRequest();

    request.onload = function () {
        
        if (request.status >= 200 && request.status < 400) {
            var json = JSON.parse(request.responseText);
            data = json.data;
            createContent();
            for(let i = 0; i < 12 ; i++){
                createAttrBox(data[i].images[0] , data[i].name , data[i].mrt , data[i].category);
            }; 
        }else{
            console.log("something wrong");
        };
    };

    request.open("get" , requestURL , true);
    request.send();
};    

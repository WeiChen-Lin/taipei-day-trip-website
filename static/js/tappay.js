TPDirect.setupSDK(20420, "app_a7gVmrstIyZXQx61YU7OLUMOtrmKRgVRXMy6t9hp3dD6KRo2GFS0vE6ZAKjT", 'sandbox')
let card_number = document.querySelector("#card-number");
let exp_day = document.getElementById('tappay-expiration-date');
let cvc = document.querySelector("#cvc");
TPDirect.card.setup({
                    fields: {
                        number: {
                            element: card_number,
                            placeholder: '**** **** **** ****'
                        },
                        expirationDate: {
                            element: exp_day,
                            placeholder: 'MM / YY'
                        },
                        ccv: {
                            element: document.querySelector("#cvc"),
                            placeholder: '後三碼'
                        }
                    },
                    styles: {
                        'input': {
                            'color': 'gray'
                        },
                        ':focus': {
                            'color': 'black'
                        },
                        '.valid': {
                            'color': 'green'
                        },
                        '.invalid': {
                            'color': 'red'
                        },
                        '@media screen and (max-width: 400px)': {
                            'input': {
                                'color': 'orange'
                            }
                        }
                    }
                })
TPDirect.card.onUpdate( function(up){
    let paybut = document.querySelector("#paybut");
    if (up.canGetPrime) {
        paybut.classList.remove("paybut_disabled");
        paybut.classList.add("paybut");
        paybut.addEventListener("click", SubmitPay, true);
        
    } else {
        paybut.className = "paybut_disabled"  
    }
})

function SubmitPay(){
    let name = document.querySelectorAll("#payinfo")[0].value;
    let email = document.querySelectorAll("#payinfo")[1].value;
    let phone = document.querySelectorAll("#payinfo")[2].value;
    TPDirect.card.getPrime( (result) => {
        let prime = result.card.prime;
        let requestURL = "https://wcl-travel.com/api/booking";
        let request = new XMLHttpRequest();
        request.onload = function(){
            if(request.status == 200){
                let json = JSON.parse(request.responseText);
                if(json.data != null){
                    let return_data = {};
                    return_data.prime = prime;
                    let price = 0;
                    let order = {};
                    let trip = [];
                    json.data.forEach(Attr => {
                        price = price + parseInt(Attr.price);
                        let attraction = {};
                        attraction.attraction = Attr.attraction;
                        attraction.date = Attr.date;
                        attraction.time = Attr.time;
                        trip.push(attraction)
                    });
                    order.price = price;
                    order.trip = trip;
                    let contact = {};
                    contact.name = name;
                    contact.email = email;
                    contact.phone_number = phone;
                    order.contact = contact;
                    
                    return_data.order = order;
                    PaytoBack(return_data);
                }
            }
        }
        request.open("GET" , requestURL , true);
        request.setRequestHeader('content-type', 'application/json');
        request.send();
        });
}

function PaytoBack(data){
    let data_to_python = JSON.stringify(data);
    let requestURL = "https://wcl-travel.com/api/orders";
    let request = new XMLHttpRequest();
    request.onload = function(){
        let json = JSON.parse(request.responseText);
        if(request.status == 200){
            window.location.href="https://wcl-travel.com/thankyou"
        }else if(request.status == 403){
            console.log(json.message);
            window.location.href="https://wcl-travel.com/"
        }
    }
    request.open("POST" , requestURL , true);
    request.setRequestHeader('content-type', 'application/json');
    request.send(data_to_python);
}

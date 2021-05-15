from flask import *
import sys , json, jwt, datetime
sys.path.append("./data")

from SQLoperation import MySQLCon, User_MySQLCon
from dotenv import dotenv_values

config = dotenv_values(".env")

sqlConfig = {
    "host" : config["host"],
    "port" : int(config["port"]),
    "user" : config["user"],
    "password" : config["password"],
    "db" : config["db"],
    "charset" : config["charset"]
}


sqlObject = MySQLCon(sqlConfig)
UsersqlObject = User_MySQLCon(sqlConfig)
app=Flask(__name__) 

app.config["JSON_AS_ASCII"]=False
app.config["TEMPLATES_AUTO_RELOAD"]=True
app.config["SECRET_KEY"] = config["secret_key"]


# Pages
@app.route("/")
def index():
    return render_template("index.html")

@app.route("/attraction/<id>")
def attraction(id):
    
    return render_template("attraction.html" , id = id)

@app.route("/booking")
def booking():
    return render_template("booking.html")

@app.route("/thankyou")
def thankyou():
    return render_template("thankyou.html")

@app.route("/api/attractions")
def AttrwithKey():
    page = int(request.args.get("page"))
    keyword = request.args.get("keyword")
    
    if keyword == None:
        keyword = ""
	
    to_json = sqlObject.getAttraction_withPage(page , keyword)

    return(json.dumps(to_json , ensure_ascii=False))

@app.route("/api/attraction/<id>")
def AttrwithId(id):
	
    return json.dumps(sqlObject.fromIdSearchAttr(id) , ensure_ascii=False )

@app.route("/api/user" , methods=["POST", "PATCH", "GET", "DELETE"])
def User():
    #登入方面
    if request.method == 'PATCH':
        
        data = request.get_json()

        if (data["email"] != "") & (data["password"] != ""):
            
            email = data["email"]
            password = data["password"]

            email_check , password_check = UsersqlObject.SignInUserCheck(email , password)
            
            print(email_check , password_check)

            if (email_check[0] == 1):

                if password_check:

                    if password == password_check[0]: 

                        expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=30)

                        response = make_response( jsonify({"ok":True}) , 200)

                        token  = jwt.encode( {"email":email , "exp": expire} , app.config["SECRET_KEY"])
                        
                        response.set_cookie(key="token" , value=token , expires=expire)

                        response.headers["Content-Type"] = "application/json"
                        
                        return response
                    
                    else:
                        response = make_response( jsonify({"error":True , "message":"帳號或密碼錯誤請重新輸入"}) , 400)
                
                        response.headers["Content-Type"] = "application/json"
                        
                        return response
                
                else:
                    response = make_response( jsonify({"error":True , "message":"帳號或密碼錯誤請重新輸入"}) , 400)
                
                    response.headers["Content-Type"] = "application/json"
                    
                    return response

            elif (email_check != 1) or (password_check != password) :
                
                response = make_response( jsonify({"error":True , "message":"帳號或密碼錯誤請重新輸入"}) , 400)
                
                response.headers["Content-Type"] = "application/json"
                
                return response
            
            else:

                response = make_response( jsonify({"error":True , "message":"伺服器錯誤"}) , 500)
                
                response.headers["Content-Type"] = "application/json"
                
                return response
    
        else:
            
                response = make_response( jsonify({"error":True , "message":"請輸入帳號及密碼"}) , 500)
                
                response.headers["Content-Type"] = "application/json"
                
                return response

    #註冊方面
    elif request.method == "POST":

        data = request.get_json()

        email = data["email"]
        password = data["password"]
        username = data["username"]

        if (email == "") or (password == "") or (username ==""):
            response = make_response( jsonify({"error":True, "message": "每個欄位皆須填寫"}) , 400)    
            response.headers["Content-Type"] = "application/json"
            return response

        else:

            username_check , email_check = UsersqlObject.SignUpUserCheck(username , email)

            if (username_check[0] == 0) & (email_check[0] == 0):
                
                #使用者資料新增進資料庫
                UsersqlObject.tableInsertUser(email, password, username)

                response = make_response( jsonify({"ok":True}) , 200)
                
                response.headers["Content-Type"] = "application/json"
                
                return response

            elif (email_check[0] != 0):

                response = make_response( jsonify({"error":True , "message":"您輸入的電子信箱已有人使用"}) , 400)
                
                response.headers["Content-Type"] = "application/json"
                
                return response            
            
            elif (username_check[0] != 0):

                response = make_response( jsonify({"error":True , "message":"使用者名稱已有人使用"}) , 400)
                
                response.headers["Content-Type"] = "application/json"
                
                return response   

            else:

                response = make_response( jsonify({"error":True , "message":"伺服器內部錯誤"}) , 500)
                
                response.headers["Content-Type"] = "application/json"
                
                return response 

    #登入取得使用者cookcie -> 不用重複登入
    elif request.method == "GET":

        cookie = request.cookies.get("token")
        
        if not cookie:
            
            response = make_response( jsonify({"data":None}) , 200)
                
            response.headers["Content-Type"] = "application/json"
            
            return response

        data = jwt.decode(cookie, app.config["SECRET_KEY"] , algorithms=['HS256'])
        
        userinfo = {"id":UsersqlObject.getUserInfor(data["email"])[0], "email":UsersqlObject.getUserInfor(data["email"])[1], "name":UsersqlObject.getUserInfor(data["email"])[2] }
        
        response = make_response( jsonify({"data":userinfo}) , 200)
        
        response.headers["Content-Type"] = "application/json"
        
        return response

    #登出方面(刪除連線)
    elif request.method == "DELETE":

        response = make_response( jsonify({"ok":True}) , 200)

        response.set_cookie(key="token" , value="" , expires=0)

        response.headers["Content-Type"] = "application/json"
        
        return response

    #最後錯誤連線方法
    else:
        return {"error":"Invalid Connection"} , 500      

app.run(port=3000 , debug=True)


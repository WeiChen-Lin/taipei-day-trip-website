import pymysql

class MySQLCon:

    def __init__(self , config):
        # 資料庫參數設定
        self.db_set = config

        # 建立Connection物件
        self.conn = pymysql.connect(**self.db_set)

    def tableInsertAtr(self , img_id, name, category, description, address, transport, MRT, latitude, longitude):
   
        #建立資料庫insert相關命令(table寫死 , 寫入id, name, category, description, address, transport, MRT, latitude, longtitude)

        insert_command = ("insert into Attraction(img_id, name, category, description, address, transport, MRT, latitude, longitude)"
        " Values (%s , %s , %s, %s , %s , %s, %s , %s , %s);" ) 
        
        with self.conn.cursor() as cursor:
            cursor.execute(insert_command , (img_id, name, category, description, address, transport, MRT, latitude, longitude))
            self.conn.commit()

    def tableInsertImg(self , img_id, image_url):
   
        #建立資料庫insert相關命令(table寫死 , 寫入img_id, image_url)

        insert_command = "insert into Attr_img(img_id, image_url) Values (%s , %s);" 
        
        with self.conn.cursor() as cursor:
            cursor.execute(insert_command , (img_id, image_url))
            self.conn.commit()

    def getAttraction_withPage(self , page, keyword):
        
        #先確認page正確與否
        if page < 0:
            error_json = {}
            error_json["error"] = True
            error_json["message"] = "頁數請由第零頁開始"

            return error_json 
        
        # 2.先得出得到的景點數
        attr_count_command =  "select count(*) from Attraction where name like %s"
        
        keyword = "%" + keyword + "%"
        with self.conn.cursor() as cursor:
            cursor.execute(attr_count_command , (keyword))
            attr_count = cursor.fetchone()[0]
            
        #景點數目為0的錯誤
        if attr_count == 0 :
            error_json = {}
            error_json["error"] = True
            error_json["message"] = "您輸入的景點未搜尋到"

            return error_json 
        
        # 3.從資料庫中拉出符合keyword資料
        attr_list_command = "select * from Attraction where name like %s limit %s , %s"
        img_list_command =  "select image_url from Attr_img where img_id = %s"
        
        with self.conn.cursor() as cursor:
            cursor.execute(attr_list_command , (keyword , page*12 , 12) )
            attr_list = cursor.fetchall()
            
        # 4.開始建構python字典 -> 之後會轉成json格式
        data_list = {}
        data = []
        for attr in attr_list:
            box = {}
            box_img = []
            box["id"] = attr[1]
            box["name"] = attr[2]
            box["category"] = attr[3]
            box["description"] = attr[4]
            box["address"] = attr[5]
            box["transport"] = attr[6]
            box["mrt"] = attr[7]
            box["latitude"] = attr[8]
            box["longitude"] = attr[9]
            
            with self.conn.cursor() as cursor:
                cursor.execute(img_list_command , (str(attr[1]) ) )
                img_list = cursor.fetchall()
                for img in img_list:
                    box_img.append(img[0])
            
            box["images"] = box_img
            
            data.append(box)
        
        #已完成json中data內的所有值建構，開始規劃回傳值需要哪些data，先思考傳入page正確與否
        #搜尋關鍵字所需頁數
        checkPage = ( attr_count - 1 ) // 12
        
        if page < checkPage :
            data_list["nextPage"] = page + 1
        else:
            data_list["nextPage"] = None
        
        data_list["data"] = data
        #check_item = 12 * ( page + 1)  
        #if attr_count < check_item:
        #check_item = attr_count
        
        #data_list["data"] = data[12 * page  : check_item]

        return data_list

    def fromIdSearchAttr(self , img_id):

        
        command = "select * from Attraction where img_id = %s"
        img_list_command =  "select image_url from Attr_img where img_id = %s"

        with self.conn.cursor() as cursor:
            cursor.execute(command , (img_id))
            attr = cursor.fetchone()

        if attr == None:
            error = {}
            error["error"] = True
            error["message"] = "您輸入的id搜尋不到景點(輸入範圍 : 1-319)"
            return error

        data_list = {}  
        data = []
        box = {}
        box_img = []
        box["id"] = attr[1]
        box["name"] = attr[2]
        box["category"] = attr[3]
        box["description"] = attr[4]
        box["address"] = attr[5]
        box["transport"] = attr[6]
        box["mrt"] = attr[7]
        box["latitude"] = attr[8]
        box["longitude"] = attr[9]
        
        with self.conn.cursor() as cursor:
            cursor.execute(img_list_command , (str(attr[1]) ) )
            img_list = cursor.fetchall()
            for img in img_list:
                box_img.append(img[0])
        
        box["images"] = box_img
        
        data.append(box)

        data_list["data"] = data

        return data_list

class User_MySQLCon:

    def __init__(self , config):
        # 資料庫參數設定
        self.db_set = config

        # 建立Connection物件
        self.conn = pymysql.connect(**self.db_set)

    def tableInsertUser(self, email_address, password, username):

        #建立資料庫insert相關命令(table寫死 , 寫入 username、信箱、密碼，並做檢查機制)

        insert_command = ("insert into userfromweb( email_address, password, username)"
        " Values (%s , %s , %s);" )

        with self.conn.cursor() as cursor:
            cursor.execute(insert_command , (email_address , password , username) )
            self.conn.commit()

    def SignUpUserCheck(self, username , email_address):

        check_username_command= "select count(username) FROM userfromweb WHERE username=%s;"

        with self.conn.cursor() as cursor:
            cursor.execute(check_username_command , (username) )
            self.conn.commit()
            username_check = cursor.fetchone()

        check_email_command = "select count(email_address) FROM userfromweb WHERE email_address=%s;"

        with self.conn.cursor() as cursor:
            cursor.execute(check_email_command , (email_address) )
            self.conn.commit()
            email_check = cursor.fetchone()

        return username_check , email_check

    def SignInUserCheck(self, email_address, password):

        check_email_command= "select count(email_address) FROM userfromweb WHERE email_address=%s;"

        with self.conn.cursor() as cursor:
            cursor.execute(check_email_command , (email_address) )
            self.conn.commit()
            email_check = cursor.fetchone()

        check_password_command = "select password from userfromweb where email_address=%s;"

        with self.conn.cursor() as cursor:
            cursor.execute( check_password_command , (email_address) )
            self.conn.commit()
            password_check = cursor.fetchone()

        return email_check , password_check

    def getUserInfor(self, email_address):

        command = "select id, email_address, username from userfromweb where email_address=%s"

        with self.conn.cursor() as cursor:
            cursor.execute(command , (email_address) )
            self.conn.commit()
            Info = cursor.fetchone()

        return Info


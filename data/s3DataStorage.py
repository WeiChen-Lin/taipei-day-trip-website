import boto3

class uploadFile:

    def __init__(self, config):

        self.s3 = boto3.client(
            "s3",
            aws_access_key_id = config["aws_access_key_id"],
            aws_secret_access_key = config["aws_secret_access_key"]
        )

    def returnURL(self, file, mimetype, filename):
        
        self.s3.upload_fileobj(file, "wclbucket", str(filename), ExtraArgs={'ACL':'public-read', 'ContentType': mimetype})

            
        return "https://d1ezm6krp7e7oj.cloudfront.net/" + filename
        
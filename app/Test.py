import dotenv 
import logging
import boto3
from botocore.exceptions import ClientError
import os
import json

dotenv.load_dotenv(".env",override=True)

def create_new_file(file_name):
    lambda_client = boto3.client('lambda')
    lambda_client.invoke(FunctionName='createCSVFile',
                         InvocationType='RequestResponse',
                         Payload=json.dumps({
                             "file_name":file_name
                         })
                         )
    return True
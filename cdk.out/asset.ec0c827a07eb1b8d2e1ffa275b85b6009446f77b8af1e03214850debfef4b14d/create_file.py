import json
import boto3
import os
import json

def lambda_handler(event, context):
    session = boto3.Session()
    s3 = session.resource('s3')

    body = json.loads(event['body'])

    file_name = body['file_name']
    object = s3.Object(os.getenv("BUCKET_NAME"), file_name)
    result = object.put(Body="")

    return {
        'statusCode': 200,
        'body': json.dumps(f'{file_name} saved!')
    }
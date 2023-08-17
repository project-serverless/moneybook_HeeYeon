import json
import boto3
import os
import time

def lambda_handler(event, context):

    user_id = event['body']['user_id']
    cost = event['body']['cost']
    name = event['body']['name']
    timestamp = int(time.time())

    table_name = os.getenv("TABLE_NAME")

    dynamodb = boto3.resource('dynamodb')

    table = dynamodb.Table(table_name)

    table.put_item(Item={
        'user-id': user_id,
        'time': timestamp,
        'cost': cost,
        'name': name,
    })

    return {
        'statusCode': 200,
        'body': json.dumps(f'{name} saved!')
    }
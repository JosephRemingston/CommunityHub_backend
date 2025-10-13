pipeline {
    agent any  // Use the current Jenkins container

    environment {
        AWS_REGION      = 'ap-south-1'
        ECR_REPO        = '390403879095.dkr.ecr.ap-south-1.amazonaws.com/community_hub_backend'
        IMAGE_TAG       = "${GIT_COMMIT}"
        LAMBDA_FUNCTION = 'communityhub-backend'
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/JosephRemingston/CommunityHub_backend.git'
            }
        }

        stage('Install & Test') {
            steps {
                sh 'npm install && npm test'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${ECR_REPO}:${IMAGE_TAG} ."
            }
        }

        stage('Login to ECR') {
            steps {
                withCredentials([[
                    $class: 'AmazonWebServicesCredentialsBinding',
                    credentialsId: 'aws-credentials-id'  // your Jenkins AWS credentials ID
                ]]) {
                    sh 'aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REPO'
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                sh "docker push ${ECR_REPO}:${IMAGE_TAG}"
            }
        }

        stage('Update Lambda') {
            steps {
                withCredentials([[
                    $class: 'AmazonWebServicesCredentialsBinding',
                    credentialsId: 'aws-credentials-id'
                ]]) {
                    sh """
                    aws lambda update-function-code \
                    --function-name $LAMBDA_FUNCTION \
                    --image-uri ${ECR_REPO}:${IMAGE_TAG} \
                    --region $AWS_REGION
                    """
                }
            }
        }
    }

    post {
        success {
            echo 'Deployment succeeded!'
        }
        failure {
            echo 'Deployment failed.'
        }
    }
}

pipeline {

    agent any

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Backend Test') {
            steps {
                dir('backend') {
                    sh 'mvn test'
                }
            }
        }

        stage('Frontend Build') {
            steps {
                dir('frontend') {
                    sh 'npm ci'
                    sh 'npm run build'
                }
            }
        }

        stage('Docker Build') {
            steps {
                sh 'docker build -t spendwise-backend:jenkins ./backend'

                sh '''
                    docker build \
                        --build-arg NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1 \
                        -t spendwise-frontend:jenkins \
                        ./frontend
                '''
            }
        }
    }

    post {
        success {
            echo 'SpendWise Jenkins pipeline completed successfully.'
        }

        failure {
            echo 'SpendWise Jenkins pipeline failed.'
        }

        always {
            echo 'Jenkins pipeline finished.'
        }
    }
}
pipeline {

    agent {
        label 'spendwise-agent'
    }

    environment {
        DB_HOST = 'spendwise-jenkins-postgres'
        DB_PORT = '5432'
        DB_NAME = 'spendwise'
        DB_USERNAME = 'spendwise'
        DB_PASSWORD = 'spendwise_test_password'
        JWT_SECRET = 'spendwise-jenkins-test-jwt-secret-key-2026-very-secure'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Start PostgreSQL') {
            steps {
                sh '''
                    docker rm -f spendwise-jenkins-postgres 2>/dev/null || true

                    docker run -d \
                        --name spendwise-jenkins-postgres \
                        --network jenkins_default \
                        -e POSTGRES_DB=spendwise \
                        -e POSTGRES_USER=spendwise \
                        -e POSTGRES_PASSWORD=spendwise_test_password \
                        postgres:17
                '''

                sh '''
                    echo "Waiting for PostgreSQL..."

                    until docker exec spendwise-jenkins-postgres \
                        pg_isready -U spendwise -d spendwise
                    do
                        sleep 2
                    done

                    echo "PostgreSQL is ready."
                '''
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

        always {
            sh '''
                docker rm -f spendwise-jenkins-postgres 2>/dev/null || true
            '''

            echo 'Jenkins pipeline finished.'
        }

        success {
            echo 'SpendWise Jenkins pipeline completed successfully.'
        }

        failure {
            echo 'SpendWise Jenkins pipeline failed.'
        }
    }
}
# Jenkinsfile for React App Deployment to AWS S3 and CloudFront
# Webhook Trigger: GitHub Push Event

pipeline {
    agent any

    triggers {
        githubPush()
    }

    stages {

        stage('Checkout Code') {
            steps {
                checkout scm
                echo "Branch: ${env.BRANCH_NAME}"
            }
        }

        stage('Install Dependencies') {
            steps {
                sh '/usr/bin/npm install'
            }
        }

        stage('Build React App') {
            steps {
                withCredentials([
                    string(credentialsId: 'REACT_APP_API_URL', variable: 'REACT_APP_API_URL')
                ]) {
                    sh 'CI=false /usr/bin/npm run build'
                }
            }
        }

        // ── Deploy to STAGING (dev branch) ──────────────────────
        stage('Deploy to Staging') {
            when {
                branch 'dev'     // only when dev branch is pushed
            }
            steps {
                withCredentials([
                    string(credentialsId: 'S3_BUCKET_STAGING',        variable: 'S3_BUCKET'),
                    string(credentialsId: 'CLOUDFRONT_DIST_ID_STAGING', variable: 'CLOUDFRONT_DIST_ID'),
                    string(credentialsId: 'AWS_REGION',               variable: 'AWS_REGION')
                ]) {
                    echo '🚧 Deploying to STAGING...'
                    sh """
                        /usr/bin/aws s3 sync build/ s3://${S3_BUCKET} \
                            --delete --region ${AWS_REGION}
                        /usr/bin/aws cloudfront create-invalidation \
                            --distribution-id ${CLOUDFRONT_DIST_ID} \
                            --paths "/*"
                    """
                    echo '✅ Staging deployed!'
                }
            }
        }

        // ── Deploy to PRODUCTION (main branch) ──────────────────
        stage('Deploy to Production') {
            when {
                branch 'main'    // only when main branch is pushed
            }
            steps {
                withCredentials([
                    string(credentialsId: 'S3_BUCKET',          variable: 'S3_BUCKET'),
                    string(credentialsId: 'CLOUDFRONT_DIST_ID', variable: 'CLOUDFRONT_DIST_ID'),
                    string(credentialsId: 'AWS_REGION',         variable: 'AWS_REGION')
                ]) {
                    echo '🚀 Deploying to PRODUCTION...'
                    sh """
                        /usr/bin/aws s3 sync build/ s3://${S3_BUCKET} \
                            --delete --region ${AWS_REGION}
                        /usr/bin/aws cloudfront create-invalidation \
                            --distribution-id ${CLOUDFRONT_DIST_ID} \
                            --paths "/*"
                    """
                    echo '✅ Production deployed!'
                }
            }
        }
    }

    post {
        success {
            echo "✅ Build #${BUILD_NUMBER} on ${env.BRANCH_NAME} succeeded!"
        }
        failure {
            echo "❌ Build #${BUILD_NUMBER} on ${env.BRANCH_NAME} failed!"
        }
        always {
            cleanWs()
        }
    }
}
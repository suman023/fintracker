// =====================================================
// FinTrackr - Complete DevSecOps Jenkins Pipeline
// =====================================================

pipeline {

    agent any

    // =================================================
    // ENVIRONMENT VARIABLES
    // =================================================
    environment {

        APP_NAME      = "fintrackr"

        DOCKER_IMAGE  = "suman023/fintrackr"

        DOCKER_TAG    = "v${BUILD_NUMBER}"

        SONAR_PROJECT = "suman023_fintracker"

        SONAR_ORG     = "suman023"

        MY_EMAIL      = "sumankumar02304@gmail.com"

        PATH = "/usr/bin:/usr/local/bin:${env.PATH}"
    }

    // =================================================
    // OPTIONS
    // =================================================
    options {

        timestamps()

        disableConcurrentBuilds()

        buildDiscarder(logRotator(
            numToKeepStr: '10'
        ))
    }

    // =================================================
    // STAGES
    // =================================================
    stages {

        // =============================================
        // STEP 1 - CHECKOUT CODE
        // =============================================
        stage('Checkout Code') {

            steps {

                echo '======================================='
                echo 'STEP 1 - Downloading source code'
                echo '======================================='

                checkout scm

                echo 'Code checkout completed!'
            }
        }

        // =============================================
        // STEP 2 - VERIFY NODE
        // =============================================
        stage('Verify NodeJS') {

            steps {

                echo '======================================='
                echo 'STEP 2 - Verifying NodeJS'
                echo '======================================='

                sh '''
                    which node
                    node -v
                    npm -v
                '''

                echo 'NodeJS verified!'
            }
        }

        // =============================================
        // STEP 3 - INSTALL DEPENDENCIES
        // =============================================
        stage('Install Dependencies') {

            steps {

                echo '======================================='
                echo 'STEP 3 - Installing dependencies'
                echo '======================================='

                dir('backend') {

                    sh '''
                        rm -rf node_modules package-lock.json

                        npm install

                        chmod -R +x node_modules/.bin || true
                    '''
                }

                echo 'Dependencies installed!'
            }
        }

        // =============================================
        // STEP 4 - RUN TESTS
        // =============================================
        stage('Run Tests') {

            steps {

                echo '======================================='
                echo 'STEP 4 - Running tests'
                echo '======================================='

                dir('backend') {

                    sh '''
                        chmod -R +x node_modules/.bin || true

                        npx jest --coverage --forceExit
                    '''
                }

                echo 'Tests completed!'
            }
        }

        // =============================================
        // STEP 5 - SONARCLOUD SCAN
        // =============================================
        stage('SonarCloud Scan') {

            steps {

                echo '======================================='
                echo 'STEP 5 - SonarCloud analysis'
                echo '======================================='

                withSonarQubeEnv('SonarCloud') {

                    sh """
                        npx sonar-scanner \
                          -Dsonar.projectKey=${SONAR_PROJECT} \
                          -Dsonar.organization=${SONAR_ORG} \
                          -Dsonar.sources=backend \
                          -Dsonar.tests=backend \
                          -Dsonar.test.inclusions=**/*.test.js \
                          -Dsonar.exclusions=**/node_modules/**,**/coverage/**,**/package-lock.json \
                          -Dsonar.javascript.lcov.reportPaths=backend/coverage/lcov.info \
                          -Dsonar.host.url=https://sonarcloud.io
                    """
                }

                echo 'SonarCloud scan completed!'
            }
        }

        // =============================================
        // STEP 6 - BUILD DOCKER IMAGE
        // =============================================
        stage('Docker Build') {

            steps {

                echo '======================================='
                echo 'STEP 6 - Building Docker image'
                echo '======================================='

                sh """
                    docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} .
                """

                sh """
                    docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:latest
                """

                echo 'Docker image built successfully!'
            }
        }

        // =============================================
        // STEP 7 - VERIFY TRIVY
        // =============================================
        stage('Verify Trivy') {

            steps {

                echo '======================================='
                echo 'STEP 7 - Verifying Trivy'
                echo '======================================='

                sh '''
                    trivy --version
                '''

                echo 'Trivy verified!'
            }
        }

        // =============================================
        // STEP 8 - TRIVY SECURITY SCAN
        // =============================================
        stage('Trivy Security Scan') {

            steps {

                echo '======================================='
                echo 'STEP 8 - Running Trivy scan'
                echo '======================================='

                sh '''

                    mkdir -p trivy-reports

                    if [ ! -f /usr/local/share/trivy/templates/html.tpl ]; then

                        sudo mkdir -p /usr/local/share/trivy/templates

                        sudo wget \
                        https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/html.tpl \
                        -O /usr/local/share/trivy/templates/html.tpl

                    fi

                    trivy image \
                    --severity HIGH,CRITICAL \
                    --format template \
                    --template "@/usr/local/share/trivy/templates/html.tpl" \
                    -o trivy-reports/trivy-report.html \
                    ${DOCKER_IMAGE}:latest
                '''

                echo 'Trivy scan completed!'
            }

            post {

                always {

                    archiveArtifacts artifacts: 'trivy-reports/trivy-report.html', fingerprint: true
                }
            }
        }

        // =============================================
        // STEP 9 - PUSH IMAGE TO DOCKERHUB
        // =============================================
        stage('Docker Push') {

            steps {

                echo '======================================='
                echo 'STEP 9 - Pushing Docker image'
                echo '======================================='

                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-credentials',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {

                    sh '''
                        echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                    '''

                    sh """
                        docker push ${DOCKER_IMAGE}:${DOCKER_TAG}
                    """

                    sh """
                        docker push ${DOCKER_IMAGE}:latest
                    """
                }

                echo 'Docker image pushed!'
            }
        }

        // =============================================
        // STEP 10 - DEPLOY APPLICATION
        // =============================================
        stage('Deploy Application') {

            steps {

                echo '======================================='
                echo 'STEP 10 - Deploying application'
                echo '======================================='

                sh '''

                    docker compose down || true

                    docker compose up -d --build

                    sleep 15

                    docker compose ps
                '''

                echo 'Application deployed successfully!'
            }
        }
    }

    // =================================================
    // POST ACTIONS
    // =================================================
    post {

        success {

            echo '======================================='
            echo 'BUILD SUCCESSFUL!'
            echo '======================================='

            emailext(
                subject: "SUCCESS - FinTrackr Build #${BUILD_NUMBER}",
                body: """
                    Build Successful!

                    Project: ${APP_NAME}

                    Build Number: ${BUILD_NUMBER}

                    Build URL:
                    ${BUILD_URL}

                    Docker Image:
                    ${DOCKER_IMAGE}:${DOCKER_TAG}
                """,
                to: "${MY_EMAIL}"
            )
        }

        failure {

            echo '======================================='
            echo 'BUILD FAILED!'
            echo '======================================='

            emailext(
                subject: "FAILED - FinTrackr Build #${BUILD_NUMBER}",
                body: """
                    Build Failed!

                    Project: ${APP_NAME}

                    Build Number: ${BUILD_NUMBER}

                    Check console logs:
                    ${BUILD_URL}console
                """,
                to: "${MY_EMAIL}"
            )
        }

        always {

            script {

                echo '======================================='
                echo 'Cleaning workspace'
                echo '======================================='

                sh 'docker logout || true'
            }

            cleanWs()
        }
    }
}

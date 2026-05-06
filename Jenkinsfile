// =====================================================
// Jenkinsfile - FinTrackr DevSecOps Pipeline
// Production Style + Beginner Friendly
// =====================================================

pipeline {

    agent any

    // -------------------------------------------------
    // TOOLS
    // -------------------------------------------------
    tools {
        nodejs 'NodeJS-20'
    }

    // -------------------------------------------------
    // ENV VARIABLES
    // -------------------------------------------------
    environment {

        APP_NAME      = "fintrackr"

        DOCKER_IMAGE  = "suman023/fintrackr"

        DOCKER_TAG    = "v${BUILD_NUMBER}"

        MY_EMAIL      = "sumankumar02304@gmail.com"

        SONAR_PROJECT = "suman023_fintracker"

        SONAR_ORG     = "suman023"
    }

    // -------------------------------------------------
    // OPTIONS
    // -------------------------------------------------
    options {
        timestamps()
        disableConcurrentBuilds()
    }

    // -------------------------------------------------
    // STAGES
    // -------------------------------------------------
    stages {

        // =============================================
        // STEP 1 - DOWNLOAD CODE
        // =============================================
        stage('Code Checkout') {

            steps {

                echo '======================================='
                echo 'STEP 1 - Downloading source code'
                echo '======================================='

                checkout scm

                echo 'Code checkout successful!'
            }
        }

        // =============================================
        // STEP 2 - VERIFY NODE VERSION
        // =============================================
        stage('Verify Environment') {

            steps {

                echo '======================================='
                echo 'STEP 2 - Verifying environment'
                echo '======================================='

                sh '''
                    node --version
                    npm --version
                '''
            }
        }

        // =============================================
        // STEP 3 - INSTALL DEPENDENCIES
        // =============================================
        stage('Install Dependencies') {

            steps {

                echo '======================================='
                echo 'STEP 3 - Installing packages'
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
                echo 'STEP 4 - Running Jest tests'
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
                echo 'STEP 5 - SonarCloud scan'
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

                echo "Docker image created!"
            }
        }

        // =============================================
        // STEP 7 - INSTALL TRIVY (IF NOT INSTALLED)
        // =============================================
        stage('Install Trivy') {

            steps {

                echo '======================================='
                echo 'STEP 7 - Installing Trivy'
                echo '======================================='

                sh '''

                    if ! command -v trivy &> /dev/null
                    then

                        sudo apt-get update

                        sudo apt-get install -y wget apt-transport-https gnupg lsb-release

                        wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key \
                        | gpg --dearmor \
                        | sudo tee /usr/share/keyrings/trivy.gpg > /dev/null

                        echo "deb [signed-by=/usr/share/keyrings/trivy.gpg] https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main" \
                        | sudo tee /etc/apt/sources.list.d/trivy.list

                        sudo apt-get update

                        sudo apt-get install -y trivy

                    fi

                    trivy --version
                '''
            }
        }

        // =============================================
        // STEP 8 - TRIVY SECURITY SCAN
        // =============================================
        stage('Trivy Scan') {

    steps {

        echo '======================================='
        echo 'STEP 8 - Security scanning'
        echo '======================================='

        sh '''

            mkdir -p trivy-reports

            trivy image \
            --severity HIGH,CRITICAL \
            --format template \
            --template "@/usr/local/share/trivy/templates/html.tpl" \
            -o trivy-reports/trivy-report.html \
            suman023/fintrackr:latest

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
        // STEP 9 - PUSH TO DOCKERHUB
        // =============================================
        stage('Docker Push') {

            steps {

                echo '======================================='
                echo 'STEP 9 - Pushing image to DockerHub'
                echo '======================================='

                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-credentials',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {

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

                echo 'Docker image pushed successfully!'
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

                echo 'Application deployed!'
            }
        }
    }

    // -------------------------------------------------
    // POST ACTIONS
    // -------------------------------------------------
    post {

        success {

            echo '======================================='
            echo 'BUILD SUCCESSFUL!'
            echo '======================================='

            emailext(
                subject: "SUCCESS - FinTrackr Build #${BUILD_NUMBER}",
                body: """
                    Build Successful!

                    Job Name: ${JOB_NAME}

                    Build Number: ${BUILD_NUMBER}

                    Build URL:
                    ${BUILD_URL}

                    Application deployed successfully.
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

                    Job Name: ${JOB_NAME}

                    Build Number: ${BUILD_NUMBER}

                    Check logs:
                    ${BUILD_URL}console
                """,
                to: "${MY_EMAIL}"
            )
        }

        always {

            echo '======================================='
            echo 'Cleaning workspace'
            echo '======================================='

            sh 'docker logout || true'

            cleanWs()
        }
    }
}

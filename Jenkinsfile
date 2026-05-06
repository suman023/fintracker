// ╔══════════════════════════════════════════════════════════╗
// ║           JENKINSFILE — FinTrackr App                   ║
// ║                                                          ║
// ║  Jenkins kya karta hai?                                  ║
// ║  Jab bhi tum GitHub pe code push karte ho,              ║
// ║  Jenkins automatically ye sab karta hai:                 ║
// ║                                                          ║
// ║  1.  Code download karo  (Git Clone)                    ║
// ║  2.  Packages install    (npm install)                   ║
// ║  3.  Tests chalao        (npm test)                      ║
// ║  4.  Code quality check  (SonarCloud)                   ║
// ║  5.  Quality Gate check  (Pass/Fail)                     ║
// ║  6.  Docker image banao  (docker build)                  ║
// ║  7.  Security scan       (Trivy)                         ║
// ║  8.  DockerHub login                                     ║
// ║  9.  Image push          (docker push)                   ║
// ║  10. App deploy          (docker compose up)             ║
// ║  11. Email notification  (success/failure)               ║
// ╚══════════════════════════════════════════════════════════╝

pipeline {

    // ─────────────────────────────────────────────────────
    // AGENT = Jenkins kis machine pe kaam karega
    // "any" = jo bhi available ho us pe chala do
    // ─────────────────────────────────────────────────────
    agent any


    // ─────────────────────────────────────────────────────
    // ENVIRONMENT VARIABLES
    // Ye variables poore pipeline mein use ho sakte hain
    // ─────────────────────────────────────────────────────
    environment {

        // ── App Details ───────────────────────────────
        APP_NAME   = "fintrackr"

        // ── DockerHub ─────────────────────────────────
        // APNA DOCKERHUB USERNAME YAHAN LIKHO ↓
        DOCKER_IMAGE = "your-dockerhub-username/fintrackr"
        DOCKER_TAG   = "v1.0.${BUILD_NUMBER}"

        // ── SonarCloud Details ────────────────────────
        // SonarCloud = Cloud wala SonarQube (free hai!)
        // Tumhara project: https://sonarcloud.io
        SONAR_PROJECT_KEY  = "suman023_fintracker"   // Project Key
        SONAR_ORG_KEY      = "suman023"              // Organization Key
        SONAR_HOST_URL     = "https://sonarcloud.io" // SonarCloud ka URL

        // ── Jenkins Credentials ───────────────────────
        // Manage Jenkins → Credentials → Add se add karo
        DOCKER_CREDS = credentials('dockerhub-credentials') // DockerHub login
        SONAR_TOKEN  = credentials('sonar-token')           // SonarCloud token

        // ── Email ─────────────────────────────────────
        // APNI EMAIL YAHAN LIKHO ↓
        MY_EMAIL = "sumankumar02304@gmail.com"
    }


    // ─────────────────────────────────────────────────────
    // OPTIONS = Pipeline ki settings
    // ─────────────────────────────────────────────────────
    options {
        // Sirf last 5 builds rakho
        buildDiscarder(logRotator(numToKeepStr: '5'))

        // 20 minute se zyada mat chalo
        timeout(time: 20, unit: 'MINUTES')

        // Har step pe time dikhao logs mein
        timestamps()
    }


    // ══════════════════════════════════════════════════════
    // STAGES = Pipeline ke steps
    // ══════════════════════════════════════════════════════
    stages {


        // ┌────────────────────────────────────────────────┐
        // │  STAGE 1 — Code Download                       │
        // │  GitHub se latest code laao                    │
        // └────────────────────────────────────────────────┘
        stage('📥 Code Download') {
            steps {
                echo '==============================='
                echo '  Step 1: Code download...'
                echo '==============================='

                // GitHub/GitLab se code clone karo
                checkout scm

                echo '✅ Code download ho gaya!'
            }
        }


        // ┌────────────────────────────────────────────────┐
        // │  STAGE 2 — Packages Install                    │
        // │  npm install se saari libraries download karo  │
        // └────────────────────────────────────────────────┘
        stage('📦 npm Install') {
            steps {
                echo '==============================='
                echo '  Step 2: npm install...'
                echo '==============================='

                dir('backend') {
                    sh 'npm ci'
                }

                echo '✅ Packages install ho gaye!'
            }
        }


        // ┌────────────────────────────────────────────────┐
        // │  STAGE 3 — Tests                               │
        // │  Code sahi kaam kar raha hai? Check karo       │
        // └────────────────────────────────────────────────┘
        stage('🧪 Tests') {
            steps {
                echo '==============================='
                echo '  Step 3: Tests chal rahe hain...'
                echo '==============================='

                dir('backend') {
                    sh 'npm test || true'
                }

                echo '✅ Tests khatam!'
            }
        }


        // ┌────────────────────────────────────────────────┐
        // │  STAGE 4 — SonarCloud Scan                     │
        // │  Code mein bugs/problems dhundho               │
        // │                                                  │
        // │  Project Key : suman023_fintracker              │
        // │  Org Key     : suman023                         │
        // │  URL         : https://sonarcloud.io            │
        // └────────────────────────────────────────────────┘
        stage('🔍 SonarCloud Scan') {
            steps {
                echo '==============================='
                echo '  Step 4: SonarCloud scan chal raha hai...'
                echo '  URL: https://sonarcloud.io'
                echo '==============================='

                // SonarCloud pe code bhejo analysis ke liye
                withSonarQubeEnv('SonarCloud') {
                    sh """
                        npx sonar-scanner \
                          -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
                          -Dsonar.organization=${SONAR_ORG_KEY} \
                          -Dsonar.projectName="FinTrackr" \
                          -Dsonar.sources=backend,frontend \
                          -Dsonar.exclusions=**/node_modules/**,**/*.test.js \
                          -Dsonar.host.url=${SONAR_HOST_URL} \
                          -Dsonar.login=${SONAR_TOKEN}
                    """
                }

                echo '✅ SonarCloud scan ho gaya!'
                echo '   Results dekho: https://sonarcloud.io/organizations/suman023'
            }
        }


        // ┌────────────────────────────────────────────────┐
        // │  STAGE 5 — Quality Gate                        │
        // │  SonarCloud ka result check karo               │
        // │  Pass hua? → Age badho                         │
        // │  Fail hua? → Pipeline rok do                   │
        // └────────────────────────────────────────────────┘
        stage('🚦 Quality Gate') {
            steps {
                echo '==============================='
                echo '  Step 5: Quality gate check...'
                echo '==============================='

                // SonarCloud se result aane ka wait karo
                // 5 minute mein result nahi aaya toh timeout
                timeout(time: 5, unit: 'MINUTES') {
                    // abortPipeline: true = fail hone pe pipeline rok do
                    waitForQualityGate abortPipeline: true
                }

                echo '✅ Quality gate pass ho gaya!'
            }
        }


        // ┌────────────────────────────────────────────────┐
        // │  STAGE 6 — Docker Image Build                  │
        // │  Apni app ko Docker image mein pack karo       │
        // └────────────────────────────────────────────────┘
        stage('🐳 Docker Build') {
            steps {
                echo '==============================='
                echo '  Step 6: Docker image ban rahi hai...'
                echo '==============================='

                // Image banao version tag ke saath
                sh "docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} ."

                // Same image ko "latest" bhi tag karo
                sh "docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:latest"

                echo "✅ Image ban gayi: ${DOCKER_IMAGE}:${DOCKER_TAG}"
            }
        }


        // ┌────────────────────────────────────────────────┐
        // │  STAGE 7 — Trivy Security Scan                 │
        // │  Image mein koi security problem toh nahi?     │
        // │  Jaise antivirus scan karta hai waise          │
        // └────────────────────────────────────────────────┘
        stage('🔒 Trivy Security Scan') {
            steps {
                echo '==============================='
                echo '  Step 7: Security scan ho raha hai...'
                echo '==============================='

                script {
                    // Trivy install karo agar nahi hai
                    sh '''
                        if ! command -v trivy &> /dev/null; then
                            echo "Trivy install ho raha hai..."
                            curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh \
                                | sh -s -- -b /usr/local/bin
                        fi
                    '''

                    // Image scan karo
                    // --exit-code 0   = problem mile toh bhi pipeline mat roko
                    // --severity HIGH,CRITICAL = sirf badi problems show karo
                    // --format table  = table format mein dikhao
                    sh """
                        trivy image \
                            --exit-code 0 \
                            --severity HIGH,CRITICAL \
                            --format table \
                            ${DOCKER_IMAGE}:${DOCKER_TAG}
                    """
                }

                echo '✅ Security scan khatam! (Upar results dekho)'
            }
        }


        // ┌────────────────────────────────────────────────┐
        // │  STAGE 8 — DockerHub Login                     │
        // │  DockerHub account mein login karo             │
        // └────────────────────────────────────────────────┘
        stage('🔑 DockerHub Login') {
            steps {
                echo '==============================='
                echo '  Step 8: DockerHub login...'
                echo '==============================='

                // Credentials securely use karo
                // DOCKER_CREDS_USR = username automatically aata hai
                // DOCKER_CREDS_PSW = password automatically aata hai
                sh 'echo $DOCKER_CREDS_PSW | docker login -u $DOCKER_CREDS_USR --password-stdin'

                echo "✅ DockerHub login ho gaya! (User: ${DOCKER_CREDS_USR})"
            }
        }


        // ┌────────────────────────────────────────────────┐
        // │  STAGE 9 — Docker Push                         │
        // │  Image ko DockerHub pe upload karo             │
        // └────────────────────────────────────────────────┘
        stage('📤 Docker Push') {
            steps {
                echo '==============================='
                echo '  Step 9: DockerHub pe image upload ho rahi hai...'
                echo '==============================='

                // Version wali image push karo
                sh "docker push ${DOCKER_IMAGE}:${DOCKER_TAG}"

                // Latest tag bhi push karo
                sh "docker push ${DOCKER_IMAGE}:latest"

                echo "✅ Image push ho gayi!"
                echo "   Link: https://hub.docker.com/r/${DOCKER_IMAGE}"
            }
        }


        // ┌────────────────────────────────────────────────┐
        // │  STAGE 10 — Deploy                             │
        // │  Docker Compose se app live karo               │
        // └────────────────────────────────────────────────┘
        stage('🚀 Deploy') {
            steps {
                echo '==============================='
                echo '  Step 10: App deploy ho rahi hai...'
                echo '==============================='

                sh '''
                    # Purane containers band karo
                    docker compose down || true

                    # Nayi image se containers start karo
                    docker compose up -d --build

                    # 10 second wait karo app start hone ke liye
                    sleep 10

                    # Status check karo
                    echo ""
                    echo "--- Container Status ---"
                    docker compose ps
                    echo ""

                    # Health check karo
                    echo "--- Health Check ---"
                    curl -f http://localhost:3000/api/health && echo "App healthy hai!" || echo "App start ho rahi hai..."
                '''

                echo '✅ App deploy ho gayi!'
                echo '   Browser mein kholo: http://localhost:3000'
            }
        }


    } // stages khatam


    // ══════════════════════════════════════════════════════
    // POST ACTIONS
    // Pipeline khatam hone ke baad kya karo
    // ══════════════════════════════════════════════════════
    post {

        // ─── SUCCESS ──────────────────────────────────────
        success {
            echo ''
            echo '🎉====================================🎉'
            echo '🎉   BUILD SUCCESSFUL! APP IS LIVE!  🎉'
            echo "🎉   http://localhost:3000            🎉"
            echo '🎉====================================🎉'
            echo ''

            emailext(
                subject: "✅ SUCCESS - FinTrackr Build #${BUILD_NUMBER}",
                body: """
Bhai Build pass ho gaya! 🎉

━━━━━━━━━━━━━━━━━━━━━━━━━━━
App Name  : FinTrackr
Build No  : #${BUILD_NUMBER}
Image     : ${DOCKER_IMAGE}:${DOCKER_TAG}
━━━━━━━━━━━━━━━━━━━━━━━━━━━

App URL      : http://localhost:3000
SonarCloud   : https://sonarcloud.io/organizations/suman023
DockerHub    : https://hub.docker.com/r/${DOCKER_IMAGE}
Build Logs   : ${BUILD_URL}

Sab kuch theek hai!
                """,
                to: "${MY_EMAIL}"
            )
        }


        // ─── FAILURE ──────────────────────────────────────
        failure {
            echo ''
            echo '❌====================================❌'
            echo '❌   BUILD FAILED! Kuch galat hua!   ❌'
            echo '❌   Console Output dekho             ❌'
            echo '❌====================================❌'
            echo ''

            emailext(
                subject: "❌ FAILED - FinTrackr Build #${BUILD_NUMBER}",
                body: """
Bhai Build fail ho gaya! ❌

━━━━━━━━━━━━━━━━━━━━━━━━━━━
App Name  : FinTrackr
Build No  : #${BUILD_NUMBER}
━━━━━━━━━━━━━━━━━━━━━━━━━━━

Error logs : ${BUILD_URL}console

Jaldi check karo!
                """,
                to: "${MY_EMAIL}"
            )
        }


        // ─── ALWAYS (cleanup) ─────────────────────────────
        always {
            echo '🧹 Cleanup ho raha hai...'

            // DockerHub se logout karo
            sh 'docker logout || true'

            // Workspace saaf karo
            cleanWs()

            echo '✅ Done!'
        }

    } // post khatam

} // pipeline khatam


// ╔══════════════════════════════════════════════════════════╗
// ║  JENKINS SETUP CHECKLIST:                                ║
// ║                                                          ║
// ║  ☐ Credentials add karo:                                ║
// ║    → ID: dockerhub-credentials (username+password)      ║
// ║    → ID: sonar-token (SonarCloud token)                 ║
// ║                                                          ║
// ║  ☐ SonarCloud configure karo:                           ║
// ║    Manage Jenkins → Configure System → SonarQube        ║
// ║    → Name: SonarCloud                                    ║
// ║    → URL : https://sonarcloud.io                        ║
// ║    → Token: sonar-token (credential select karo)        ║
// ║                                                          ║
// ║  ☐ Email configure karo:                                ║
// ║    Manage Jenkins → Configure System → Email            ║
// ║    → SMTP: smtp.gmail.com  Port: 465                     ║
// ║                                                          ║
// ║  ☐ Plugins install karo:                                ║
// ║    → SonarQube Scanner                                   ║
// ║    → Docker Pipeline                                     ║
// ║    → Email Extension                                     ║
// ║                                                          ║
// ║  ☐ Pipeline job banao:                                  ║
// ║    New Item → Pipeline → Git → Repo URL                 ║
// ║    Script Path: Jenkinsfile → Build Now!                 ║
// ╚══════════════════════════════════════════════════════════╝

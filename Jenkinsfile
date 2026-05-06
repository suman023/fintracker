// ═══════════════════════════════════════════════════════════════
//   JENKINSFILE — Expensio Expense Tracker
//   Full CI/CD Pipeline with:
//     ✅ Git Clone
//     ✅ npm Install + Test
//     ✅ SonarQube (Code Quality)
//     ✅ Docker Build
//     ✅ Trivy (Security Scan)
//     ✅ Docker Login + Push
//     ✅ Deploy
//     ✅ Email Notification
//
//   Beginner Note: Har stage ek kaam karta hai.
//   Agar ek stage fail ho, baaki skip ho jaate hain.
// ═══════════════════════════════════════════════════════════════

pipeline {

  // ── Agent ─────────────────────────────────────────────────
  // "agent any" = kisi bhi available Jenkins machine pe chalao
  agent any


  // ── Environment Variables ──────────────────────────────────
  // Yeh variables poore pipeline mein use ho sakte hain
  environment {

    // App details
    APP_NAME    = 'expensio'
    APP_VERSION = "1.0.${env.BUILD_NUMBER}"  // e.g. 1.0.42

    // Docker Hub details — apna username dalo
    DOCKER_HUB_USERNAME = 'your-dockerhub-username'
    DOCKER_IMAGE        = "${DOCKER_HUB_USERNAME}/expensio"
    DOCKER_TAG          = "${APP_VERSION}"

    // Jenkins Credentials IDs — yeh Jenkins mein configure karo
    // Manage Jenkins → Credentials → Add
    DOCKER_CREDENTIALS = credentials('dockerhub-credentials')  // DockerHub login
    SONAR_TOKEN        = credentials('sonar-token')            // SonarQube token
    EMAIL_RECIPIENT    = 'your-email@gmail.com'                // Notification email

    // SonarQube Server URL — apna URL dalo
    SONAR_HOST_URL = 'http://localhost:9000'
    SONAR_PROJECT  = 'expensio-expense-tracker'

    // Git commit info (auto-filled by Jenkins)
    GIT_COMMIT_SHORT = ''
    GIT_AUTHOR       = ''
  }


  // ── Options ───────────────────────────────────────────────
  options {
    buildDiscarder(logRotator(numToKeepStr: '10'))  // Sirf last 10 builds rakhho
    timeout(time: 30, unit: 'MINUTES')              // 30 min se zyada mat chalao
    timestamps()                                     // Logs mein time show karo
    ansiColor('xterm')                              // Colored console output
  }


  // ══════════════════════════════════════════════════════════
  //   STAGES — Pipeline ke steps
  // ══════════════════════════════════════════════════════════
  stages {


    // ── STAGE 1: Git Clone ───────────────────────────────────
    // GitHub se latest code download karna
    stage('📥 Git Clone') {
      steps {
        echo '══════════════════════════════════'
        echo '  STAGE 1: Downloading code...'
        echo '══════════════════════════════════'

        // Code clone karo (Jenkins job mein configured repo se)
        checkout scm

        // Git info save karo
        script {
          GIT_COMMIT_SHORT = sh(
            script: 'git rev-parse --short HEAD',
            returnStdout: true
          ).trim()

          GIT_AUTHOR = sh(
            script: 'git log -1 --pretty=format:"%an"',
            returnStdout: true
          ).trim()
        }

        echo "✅ Code downloaded!"
        echo "   Commit: ${GIT_COMMIT_SHORT}"
        echo "   Author: ${GIT_AUTHOR}"
      }
    }


    // ── STAGE 2: Install Dependencies ───────────────────────
    // npm install — sari libraries download karo
    stage('📦 Install Dependencies') {
      steps {
        echo '══════════════════════════════════'
        echo '  STAGE 2: Installing packages...'
        echo '══════════════════════════════════'

        dir('backend') {
          // npm ci = clean install (faster & more reliable than npm install)
          sh 'npm ci'

          // Security audit — known vulnerabilities check karo
          sh 'npm audit --audit-level=high || true'
        }

        echo '✅ Packages installed!'
      }
    }


    // ── STAGE 3: Run Tests ───────────────────────────────────
    // Jest unit tests chalao — code sahi kaam kar raha hai?
    stage('🧪 Run Tests') {
      steps {
        echo '══════════════════════════════════'
        echo '  STAGE 3: Running tests...'
        echo '══════════════════════════════════'

        dir('backend') {
          sh 'npm run test:ci'
        }

        echo '✅ All tests passed!'
      }

      post {
        always {
          // Test results Jenkins dashboard mein dikhao
          junit allowEmptyResults: true,
                testResults: 'backend/test-results.xml'

          // Code coverage report
          publishHTML(target: [
            reportDir:   'backend/coverage/lcov-report',
            reportFiles: 'index.html',
            reportName:  'Code Coverage Report',
            keepAll:     true,
            allowMissing: true
          ])
        }
      }
    }


    // ── STAGE 4: SonarQube Analysis ─────────────────────────
    // Code quality check — bugs, code smells, duplications
    stage('🔍 SonarQube Analysis') {
      steps {
        echo '══════════════════════════════════'
        echo '  STAGE 4: Code quality scan...'
        echo '══════════════════════════════════'

        // SonarQube plugin ka use karo
        // Prerequisites:
        //   1. SonarQube server chalu hona chahiye
        //   2. Jenkins mein SonarQube configure karo:
        //      Manage Jenkins → Configure System → SonarQube
        //   3. sonar-token credential add karo
        withSonarQubeEnv('SonarQube') {
          sh """
            npx sonar-scanner \
              -Dsonar.projectKey=${SONAR_PROJECT} \
              -Dsonar.projectName="Expensio Expense Tracker" \
              -Dsonar.projectVersion=${APP_VERSION} \
              -Dsonar.sources=backend,frontend \
              -Dsonar.exclusions=**/node_modules/**,**/coverage/**,**/*.test.js \
              -Dsonar.javascript.lcov.reportPaths=backend/coverage/lcov.info \
              -Dsonar.host.url=${SONAR_HOST_URL} \
              -Dsonar.login=${SONAR_TOKEN}
          """
        }

        echo '✅ SonarQube scan complete!'
      }
    }


    // ── STAGE 5: Quality Gate ────────────────────────────────
    // SonarQube ka result check karo — pass hua ya fail?
    stage('🚦 Quality Gate') {
      steps {
        echo '══════════════════════════════════'
        echo '  STAGE 5: Checking quality gate...'
        echo '══════════════════════════════════'

        // SonarQube se quality gate result lo
        // Agar fail = pipeline rok do
        timeout(time: 5, unit: 'MINUTES') {
          waitForQualityGate abortPipeline: true
        }

        echo '✅ Quality gate passed!'
      }
    }


    // ── STAGE 6: Docker Build ────────────────────────────────
    // Docker image banao hamare Dockerfile se
    stage('🐳 Docker Build') {
      steps {
        echo '══════════════════════════════════'
        echo '  STAGE 6: Building Docker image...'
        echo '══════════════════════════════════'

        sh """
          docker build \
            --target production \
            --build-arg BUILD_DATE=\$(date -u +"%Y-%m-%dT%H:%M:%SZ") \
            --build-arg GIT_COMMIT=${GIT_COMMIT_SHORT} \
            --tag ${DOCKER_IMAGE}:${DOCKER_TAG} \
            --tag ${DOCKER_IMAGE}:latest \
            .
        """

        echo "✅ Image built: ${DOCKER_IMAGE}:${DOCKER_TAG}"
      }
    }


    // ── STAGE 7: Trivy Security Scan ────────────────────────
    // Docker image mein security vulnerabilities dhundho
    stage('🔒 Trivy Security Scan') {
      steps {
        echo '══════════════════════════════════'
        echo '  STAGE 7: Security scanning...'
        echo '══════════════════════════════════'

        // Trivy install karo (pehli baar)
        sh '''
          # Check if trivy is installed
          if ! command -v trivy &> /dev/null; then
            echo "Installing Trivy..."
            curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh \
              | sh -s -- -b /usr/local/bin
          fi
        '''

        // Image scan karo
        sh """
          trivy image \
            --exit-code 0 \
            --severity HIGH,CRITICAL \
            --format table \
            --output trivy-report.txt \
            ${DOCKER_IMAGE}:${DOCKER_TAG}

          # Report print karo
          cat trivy-report.txt
        """

        // Report archive karo
        archiveArtifacts artifacts: 'trivy-report.txt', allowEmptyArchive: true

        echo '✅ Security scan complete! (Check trivy-report.txt for details)'
      }
    }


    // ── STAGE 8: Docker Login ────────────────────────────────
    // DockerHub mein login karo
    stage('🔑 Docker Login') {
      steps {
        echo '══════════════════════════════════'
        echo '  STAGE 8: Logging into DockerHub...'
        echo '══════════════════════════════════'

        // Jenkins credentials se securely login karo
        // "dockerhub-credentials" ID Jenkins mein configured hai
        withCredentials([usernamePassword(
          credentialsId: 'dockerhub-credentials',
          usernameVariable: 'DOCKER_USER',
          passwordVariable: 'DOCKER_PASS'
        )]) {
          sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
        }

        echo "✅ Logged in to DockerHub as ${DOCKER_HUB_USERNAME}"
      }
    }


    // ── STAGE 9: Docker Push ─────────────────────────────────
    // Image ko DockerHub pe upload karo
    stage('📤 Docker Push') {
      steps {
        echo '══════════════════════════════════'
        echo '  STAGE 9: Pushing image to DockerHub...'
        echo '══════════════════════════════════'

        // Version tag ke saath push karo
        sh "docker push ${DOCKER_IMAGE}:${DOCKER_TAG}"

        // "latest" tag bhi push karo
        sh "docker push ${DOCKER_IMAGE}:latest"

        echo "✅ Image pushed: ${DOCKER_IMAGE}:${DOCKER_TAG}"
        echo "   DockerHub: https://hub.docker.com/r/${DOCKER_HUB_USERNAME}/expensio"
      }
    }


    // ── STAGE 10: Deploy ─────────────────────────────────────
    // Latest image se app chalao
    stage('🚀 Deploy') {
      steps {
        echo '══════════════════════════════════'
        echo '  STAGE 10: Deploying application...'
        echo '══════════════════════════════════'

        // Docker compose se deploy karo
        sh '''
          # Purani containers band karo
          docker compose down --remove-orphans || true

          # Latest image pull karo
          docker compose pull

          # Naye containers start karo
          docker compose up -d --build

          # Status dekho
          echo "--- Container Status ---"
          docker compose ps

          # App ready hone ka wait karo
          sleep 15
          echo "--- Health Check ---"
          curl -f http://localhost/api/health && echo "✅ App is healthy!" || echo "⚠️ Health check failed"
        '''

        echo '✅ Deployment complete!'
        echo "   App URL: http://localhost"
        echo "   API URL: http://localhost/api"
      }
    }


  } // end stages


  // ══════════════════════════════════════════════════════════
  //   POST ACTIONS — Pipeline khatam hone ke baad chalate hain
  // ══════════════════════════════════════════════════════════
  post {

    // ── SUCCESS ───────────────────────────────────────────────
    // Sab stages pass ho gaye ✅
    success {
      echo ''
      echo '🎉 ════════════════════════════════════════'
      echo '🎉   PIPELINE SUCCESSFUL!'
      echo "🎉   App: http://localhost"
      echo "🎉   Image: ${DOCKER_IMAGE}:${DOCKER_TAG}"
      echo '🎉 ════════════════════════════════════════'
      echo ''

      // Email notification — success
      emailext(
        subject: "✅ SUCCESS: Expensio Build #${env.BUILD_NUMBER}",
        body: """
          <html>
          <body style="font-family: Arial, sans-serif; padding: 20px;">

            <h2 style="color: #2ea043;">✅ Build Successful!</h2>

            <table style="border-collapse: collapse; width: 100%;">
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><b>Project</b></td>
                <td style="padding: 8px; border: 1px solid #ddd;">Expensio Expense Tracker</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><b>Build #</b></td>
                <td style="padding: 8px; border: 1px solid #ddd;">${env.BUILD_NUMBER}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><b>Version</b></td>
                <td style="padding: 8px; border: 1px solid #ddd;">${APP_VERSION}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><b>Branch</b></td>
                <td style="padding: 8px; border: 1px solid #ddd;">${env.BRANCH_NAME ?: 'main'}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><b>Commit</b></td>
                <td style="padding: 8px; border: 1px solid #ddd;">${GIT_COMMIT_SHORT} by ${GIT_AUTHOR}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><b>Docker Image</b></td>
                <td style="padding: 8px; border: 1px solid #ddd;">${DOCKER_IMAGE}:${DOCKER_TAG}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><b>App URL</b></td>
                <td style="padding: 8px; border: 1px solid #ddd;"><a href="http://localhost">http://localhost</a></td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><b>Duration</b></td>
                <td style="padding: 8px; border: 1px solid #ddd;">${currentBuild.durationString}</td>
              </tr>
            </table>

            <br/>
            <a href="${env.BUILD_URL}" style="
              background: #2ea043;
              color: white;
              padding: 10px 20px;
              text-decoration: none;
              border-radius: 6px;
            ">View Build Logs</a>

          </body>
          </html>
        """,
        to:          "${EMAIL_RECIPIENT}",
        mimeType:    'text/html',
        attachmentsPattern: 'trivy-report.txt'
      )
    }


    // ── FAILURE ───────────────────────────────────────────────
    // Koi stage fail ho gaya ❌
    failure {
      echo ''
      echo '💔 ════════════════════════════════════════'
      echo '💔   PIPELINE FAILED!'
      echo '💔   Check Console Output for errors'
      echo '💔 ════════════════════════════════════════'
      echo ''

      // Email notification — failure
      emailext(
        subject: "❌ FAILED: Expensio Build #${env.BUILD_NUMBER}",
        body: """
          <html>
          <body style="font-family: Arial, sans-serif; padding: 20px;">

            <h2 style="color: #f85149;">❌ Build Failed!</h2>
            <p>Kuch galat hua. Niche details dekho.</p>

            <table style="border-collapse: collapse; width: 100%;">
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><b>Project</b></td>
                <td style="padding: 8px; border: 1px solid #ddd;">Expensio Expense Tracker</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><b>Build #</b></td>
                <td style="padding: 8px; border: 1px solid #ddd;">${env.BUILD_NUMBER}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><b>Branch</b></td>
                <td style="padding: 8px; border: 1px solid #ddd;">${env.BRANCH_NAME ?: 'main'}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><b>Commit</b></td>
                <td style="padding: 8px; border: 1px solid #ddd;">${GIT_COMMIT_SHORT} by ${GIT_AUTHOR}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><b>Failed Stage</b></td>
                <td style="padding: 8px; border: 1px solid #ddd; color: #f85149;">${env.STAGE_NAME ?: 'Unknown'}</td>
              </tr>
            </table>

            <br/>
            <a href="${env.BUILD_URL}console" style="
              background: #f85149;
              color: white;
              padding: 10px 20px;
              text-decoration: none;
              border-radius: 6px;
            ">View Error Logs</a>

          </body>
          </html>
        """,
        to:       "${EMAIL_RECIPIENT}",
        mimeType: 'text/html'
      )
    }


    // ── ALWAYS ────────────────────────────────────────────────
    // Hamesha chalta hai — success ho ya fail
    always {
      echo '🧹 Cleaning up workspace...'

      // DockerHub se logout karo
      sh 'docker logout || true'

      // Old/dangling Docker images hata do (disk space bachao)
      sh 'docker image prune -f || true'

      // Jenkins workspace clean karo
      cleanWs()

      echo '✅ Cleanup done!'
    }

  } // end post

} // end pipeline


// ═══════════════════════════════════════════════════════════
//   JENKINS MEIN SETUP KARNE KE LIYE:
//
//   1. Credentials add karo (Manage Jenkins → Credentials):
//      - ID: dockerhub-credentials → DockerHub username+password
//      - ID: sonar-token          → SonarQube token (secret text)
//
//   2. SonarQube configure karo (Manage Jenkins → Configure System):
//      - Name: SonarQube
//      - URL:  http://localhost:9000
//      - Token: sonar-token credential use karo
//
//   3. Email configure karo (Manage Jenkins → Configure System):
//      - SMTP server: smtp.gmail.com
//      - Port: 465
//      - Gmail credentials add karo
//
//   4. Plugins chahiye:
//      - Docker Pipeline
//      - SonarQube Scanner
//      - Email Extension (emailext)
//      - HTML Publisher
//      - AnsiColor
// ═══════════════════════════════════════════════════════════

# MAHSA University — Internship Management System (IMS)

A web application prototype for managing internship workflows across Coordinators, Lecturers, and Students.

- **GitHub Repository**: [https://github.com/Kiddodo/mockupsystemMAHSA](https://github.com/Kiddodo/mockupsystemMAHSA)
- **Google Cloud Console Project ID**: `internship-ac115`
- **Google Cloud Console URL**: [https://console.cloud.google.com/home/dashboard?project=internship-ac115](https://console.cloud.google.com/home/dashboard?project=internship-ac115)

---

## ☁️ Google Cloud Integration (`internship-ac115`)

This repository is pre-configured to connect to Google Cloud Console project **`internship-ac115`** using multiple deployment pathways:

### Option 1: Automated CI/CD with Google Cloud Build (Recommended)
1. Open the [Cloud Build Triggers Console](https://console.cloud.google.com/cloud-build/triggers?project=internship-ac115).
2. Click **Connect Repository** and choose **GitHub**.
3. Select **`Kiddodo/mockupsystemMAHSA`**.
4. Create a trigger that uses `cloudbuild.yaml` on the `main` branch.
5. Any push to `main` will automatically build and deploy to Google Cloud App Engine under `internship-ac115`.

### Option 2: Google App Engine Deployment (`app.yaml`)
Deploy directly via Google Cloud SDK CLI:
```bash
# 1. Login to Google Cloud
gcloud auth login

# 2. Set active project
gcloud config set project internship-ac115

# 3. Deploy to App Engine
gcloud app deploy app.yaml --project=internship-ac115
```

### Option 3: Firebase Hosting (`.firebaserc` & `firebase.json`)
Firebase is part of Google Cloud and shares the same `internship-ac115` project ID:
```bash
# 1. Login to Firebase with your Google Cloud account
npx firebase-tools login

# 2. Deploy to Firebase Hosting
npx firebase-tools deploy --project internship-ac115
```

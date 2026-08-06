# Kallipolis ZK - Wiki

به مستندات فنی و تخصصی **Kallipolis ZK** خوش آمدید. این ویکی منبع اصلی برای درک عمیق معماری، پیاده‌سازی و نحوه مشارکت در پروژه است.

---

## 🧭 فهرست مطالب

1.  **[مقدمه و چشم‌انداز](#1-مقدمه-و-چشم‌انداز)**
2.  **[معماری سیستم (Architecture)](#2-معماری-سیستم)**
3.  **[راهنمای توسعه‌دهندگان (Getting Started)](#3-راهنمای-توسعه‌دهندگان)**
4.  **[مرجع API و SDK](#4-مرجع-api-و-sdk)**
5.  **[امنیت و بررسی رسمی (Security & Formal Verification)](#5-امنیت-و-بررسی-رسمی)**
6.  **[مشارکت در پروژه (Contributing)](#6-مشارکت-در-پروژه)**

---

## 1. مقدمه و چشم‌انداز
Kallipolis ZK اولین Mempool Firewall غیرمتمرکز است که از قدرت **Zero-Knowledge Proofs** برای تضمین امنیت تراکنش‌ها پیش از ثبت در بلاک‌چین استفاده می‌کند. هدف ما ایجاد یک لایه امنیتی هوشمند، مقیاس‌پذیر و Polyglot برای اکوسیستم‌های وب ۳ (به ویژه Polygon) است.

---

## 2. معماری سیستم
معماری Kallipolis بر پایه **میکروکرنل (Microkernel)** استوار است.

*   **Gateway:** نقطه ورود و مدیریت ترافیک API.
*   **Actor System:** مدیریت وظایف غیرهمگام (Async Tasks).
*   **Event Bus:** زیرساخت پیام‌رسانی بین ماژول‌ها.
*   **Prover Engine:** موتور اثبات ZK (پیاده‌سازی شده با Rust و Halo2).
*   **Polyglot Modules:** استفاده از Zig برای mempool parser، Nim برای ماژول‌های کرنل، و OCaml برای بررسی‌های رسمی.

---

## 3. راهنمای توسعه‌دهندگان
برای شروع توسعه، به مستندات **[README.md](https://github.com/LogicGuard/kallipolis-zk/blob/main/README.md)** مراجعه کنید.
اطمینان حاصل کنید که تمام پیش‌نیازها (Rust, Zig, Nim, OCaml, Docker) به درستی نصب شده‌اند.

---

## 4. مرجع API و SDK
برای تعامل با Kallipolis ZK:

*   **REST API:** تمامی endpoints در [openapi.yaml](https://github.com/LogicGuard/kallipolis-zk/blob/main/openapi.yaml) مستند شده‌اند.
*   **TypeScript SDK:**
    ```typescript
    import { KallipolisFirewall } from '@kallipolis/sdk';
    // نمونه استفاده در مستندات موجود است
    ```

---

## 5. امنیت و بررسی رسمی
امنیت هسته اصلی Kallipolis است:
*   **Formal Verification:** استفاده از OCaml برای اثبات درستی مدارهای ZK.
*   **Auditability:** قابلیت تحلیل هوشمند کدهای قراردادهای هوشمند.
*   **zk-Proofs:** تضمین صحت عملیات بدون افشای داده‌های حساس.

---

## 6. مشارکت در پروژه
ما از مشارکت‌کنندگان استقبال می‌کنیم!
1.  **[CONTRIBUTING.md](https://github.com/LogicGuard/kallipolis-zk/blob/main/CONTRIBUTING.md)** را مطالعه کنید.
2.  Issueها را بررسی کرده و با برچسب `good first issue` شروع کنید.
3.  مطابق با استاندارد CI/CD ما، کدهای خود را تست و بررسی کنید.

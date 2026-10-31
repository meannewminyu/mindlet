# 민들렛

Next.js, Supabase, Vercel 기반의 단일 개인 메모 보드입니다. 섹션·컬럼·카테고리 없이 메모 카드만 자유롭게 쌓입니다.

## 로컬 실행

1. Supabase SQL Editor에서 `schema.sql`을 실행합니다.
2. `.env.local.example`을 `.env.local`로 복사하고 값을 채웁니다.
3. `ADMIN_PASSWORD`에 관리자 로그인에서 사용할 비밀번호를 평문으로 입력합니다.
4. `ADMIN_SESSION_SECRET`에는 관리자 비밀번호와 다른 길고 무작위인 문자열을 넣습니다. 아래 명령으로 생성할 수 있습니다.

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

5. 개발 서버를 실행합니다.

```bash
npm run dev
```

## Vercel 배포

GitHub 저장소를 Vercel에 연결한 뒤 Project Settings → Environment Variables에 `.env.local.example`의 다섯 값을 등록하고 배포합니다. `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`은 Secret 유형으로 등록하고 절대 `NEXT_PUBLIC_` 접두사를 붙이지 마세요. 실제 배포에는 충분히 긴 관리자 비밀번호를 설정하세요.

## 보안 구조

- 브라우저는 공개 URL/anon key로 메모 목록만 조회합니다.
- 메모 생성 시 4자리 비밀번호 해시는 서버 API에서 bcrypt로 만듭니다.
- 일반 삭제는 서버에서 해시를 비교한 뒤 service role로 수행합니다.
- 관리자 비밀번호는 서버 전용 환경 변수에서만 읽고, 관리자 인증과 삭제는 HttpOnly 세션 쿠키를 검증하는 서버 API에서만 수행합니다.
- `schema.sql`은 명시적 `GRANT`와 RLS 정책을 함께 적용합니다.


## 강의 중 설정 순서

1. Supabase 프로젝트를 생성합니다. 새 DB는 schema.sql을, 기존 테이블과 정책이 있는 DB는 permissions.sql을 검토한 후 SQL Editor에서 직접 실행합니다. 기존 메모는 삭제하지 않습니다.
2. .env.local의 NEXT_PUBLIC_SUPABASE_URL에 프로젝트 URL, NEXT_PUBLIC_SUPABASE_ANON_KEY에 Legacy anon 키, SUPABASE_SERVICE_ROLE_KEY에 Legacy service_role 키를 입력합니다.
3. ADMIN_PASSWORD에 직접 정한 긴 비밀번호, ADMIN_SESSION_SECRET에 직접 생성한 무작위 문자열을 입력합니다. 예시 파일의 비밀번호는 운영에 사용하지 마세요.
4. npm ci 후 npm run dev로 실행합니다. PowerShell 정책으로 차단되면 npm.cmd를 사용합니다. 환경변수 변경 후 서버를 완전히 재시작합니다.
5. 작성·조회·비밀번호 삭제·관리자 로그인·개별/전체 삭제·로그아웃을 확인합니다. 기존 앱에는 수정·첨부파일 기능이 없습니다.
6. GitHub에 소스를 업로드합니다. .env.local은 Git에서 제외됩니다. 기존 원격 저장소는 변경하지 않았습니다.
7. Vercel에 저장소를 연결합니다. Root Directory는 package.json이 있는 폴더(이 작업공간에서는 padlet), Framework는 Next.js, 빌드는 npm run build입니다.
8. Vercel에도 위 다섯 환경변수를 별도로 등록하고 직접 배포합니다. NEXT_PUBLIC_ 두 변수만 공개하며 나머지 세 값은 서버 전용입니다. 공개 변수 변경 후 재배포합니다.

실제 SQL 실행, GitHub 업로드, Vercel 배포는 수행하지 않았습니다. 실제 값이 없는 .env.local을 준비했고 예시 파일은 보존했습니다.
공개 조회에서는 password_hash를 제외합니다. 관리자 쿠키는 HttpOnly, SameSite=Strict, 운영에서 Secure이며 서버에서도 8시간 만료를 확인합니다. 이전 쿠키는 재로그인이 필요합니다.
기존 로그인 시도 제한은 없습니다. 운영에서는 배포 플랫폼이나 공유 저장소 기반 제한을 추가로 설정하세요.

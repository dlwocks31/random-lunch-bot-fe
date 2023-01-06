# 랜덤런치봇

무작위 조를 선정해서 같이 점심을 먹는 랜덤런치를 진행하기 위해, 랜덤 조를 쉽고 빠르게 생성할 수 있도록 돕는 웹페이지입니다. 모두의 팀빌딩에 도움이 되었으면 좋겠습니다.

https://random-lunch-bot.vercel.app/ 을 통해 확인하실 수 있습니다.

![서비스 프리뷰](readme_preview.png)

주요 기능:

- 슬랙 워크스페이스의 유저를 조원으로 가져올 수 있습니다. (전체 유저 또는 특정 채널)
- 슬랙이 연동되지 않았다면, 조원 이름을 직접 입력해 추가할 수 있습니다.
- 같은 조 피하기 설정을 통해, 특정 조원들이 같은 조에 속하지 않도록 지정할 수 있습니다. (ex. 같은 부서이거나, 지난 랜덤런치 때 같은 조였던 경우)
- 사무실 조와 재택 조를 따로 나눌 수 있습니다. 사무실 조에 속한 조원과 재택 조에 속한 조원은 서로 같은 조로 묶이지 않습니다.
- 슬랙이 연동된 경우에, 웹페이지 내에서 조원 정보가 담긴 메세지를 슬랙으로 바로 전송할 수 있습니다.

# 기술 스택

- 프론트엔드 + 백엔드: Next.js
- 데이터베이스: Supabase

# 필요한 SaaS 서비스

- Vercel: Vercel을 통해 배포합니다.
- Supabase: 로그인 기능과, 계정별 설정 저장을 위해 사용합니다.

# 환경 변수

아래와 같은 환경변수가 필요합니다. `.env.local` 파일을 통해 만들어두면 됩니다.

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase의 Settings > API 페이지에서 확인 가능한 Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: supabase의 Settings > API 페이지에서 확인 가능한 Project API Anon Key
- `NEXT_PUBLIC_SLACK_BOT_CLIENT_ID`: 설치될 슬랙 앱의 Client ID
- `SLACK_BOT_CLIENT_SECRET`: 설치될 슬랙 앱의 Client Secret
- `NEXT_PUBLIC_SLACK_OAUTH_CALLBACK_HOST`: 슬랙 앱 연동 시, Slack Oauth Callback 요청을 받을 Host (ex: `https://random-lunch-bot.vercel.app`)
- `NEXT_PUBLIC_REDIRECT_BACK_HOST`: 슬랙 앱 연동 시, 연동 완료 후 슬랙 다시 돌아올 페이지

# 실행 방식

- `yarn` 을 통해 의존성을 설정합니다.
- `yarn dev` 로 로컬에서 Next.js 서버를 실행합니다.

# 히스토리

이 웹페이지는 최초에 [맘편한세상](https://www.mfort.co.kr/)의 사내 랜덤런치용으로 제작되었고, 현재는 다른 조직에서도 사용할 수 있게 확장되었습니다.

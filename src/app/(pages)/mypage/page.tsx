import { TopBar } from "@/app/_common/components/top-bar";
import UnderBar from "@/app/_common/components/under-bar";
import ProfileHeader from "./components/ProfileHeader";
import MyPlating from "./components/MyPlating";
import FAQAccordion from "./components/FAQAccordion";

const faqItems = [
  {
    q: "픽플 무료/유료 서비스의 차이는 무엇인가요?",
    a: "무료 서비스는 기본 템플릿과 저장 기능을 제공하고, 유료는 AI 추천, 고급 템플릿, 고화질 저장 등 추가 기능을 제공합니다.",
  },
  {
    q: "회원가입은 꼭 해야 하나요?",
    a: "비회원도 일부 기능을 사용할 수 있지만, 저장/즐겨찾기/히스토리는 회원 전용입니다.",
  },
  {
    q: "AI 스튜디오는 언제, 어떻게 사용하나요?",
    a: "마이페이지의 'AI 스튜디오' 버튼을 통해 접속해, 사진을 업로드하거나 템플릿을 선택해 결과를 받을 수 있어요.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />

      <main className="flex-1">
        <div className="mx-auto max-w-[1440px] px-4 md:px-6 lg:px-8">
          {/*  여기서 간격만 조절 */}
          <div className="flex flex-col gap-[120px] md:gap-[160px]">
            <ProfileHeader
              nickname="닉네임"
              avatarUrl="/svg/avatar.png"
              received={0}
              picked={10}
            />
            <MyPlating />
            <FAQAccordion items={faqItems} />
            <UnderBar />
          </div>
        </div>
      </main>
    </div>
  );
}

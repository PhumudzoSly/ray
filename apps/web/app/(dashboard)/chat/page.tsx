import { Chat } from "@/components/chat/chat";
import { ExpandedLayoutContainer } from "@/components/expanded-layout-container";
import Header from "@/components/shared/header";

export default function ChatPage() {
  return (
    <>
      <Header crumb={[{ title: "Chat", url: "/chat" }]}>{null}</Header>
      <ExpandedLayoutContainer sidebar={<></>}>
        <Chat />
      </ExpandedLayoutContainer>
    </>
  );
}

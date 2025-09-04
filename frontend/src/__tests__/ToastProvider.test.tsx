import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ToastContainer } from "@/components/ToastProvider";
import { useToastStore } from "@/stores/toastStore";
import { afterEach } from "vitest";
import { MemoryRouter } from "react-router-dom";

afterEach(() => {
  useToastStore.getState().clearAllToasts();
});

describe("ToastProvider", () => {
  it("renders a toast and can dismiss it", async () => {
    const user = userEvent.setup();
    // 1) 스토어로 토스트 추가(컴포넌트 외부 상태 업데이트이므로 act)
    await act(async () => {
      useToastStore.getState().addToast("success", "hello");
    });

    render(
      <MemoryRouter>
        <ToastContainer />
      </MemoryRouter>
    );

    // 2) 토스트 컨테이너가 보이고, 메시지가 나타남
    expect(
      await screen.findByRole("region", { name: /notifications/i })
    ).toBeInTheDocument();
    expect(await screen.findByText("hello")).toBeInTheDocument();

    // 3) 닫기 버튼 클릭 -> 사라짐
    await user.click(await screen.findByRole("button"));
    expect(screen.queryByText("hello")).not.toBeInTheDocument();
  });

  it("confirm toast calls callbacks and disappears", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    // 1) 확인용 토스트 추가
    await act(async () => {
      useToastStore.getState().addConfirmToast("confirm?", onConfirm, onCancel);
    });

    render(
      <MemoryRouter>
        <ToastContainer />
      </MemoryRouter>
    );

    expect(await screen.findByText("confirm?")).toBeInTheDocument();

    // 2) 삭제(확인) 클릭 -> onConfirm 호출되고 사라짐
    await user.click(screen.getByRole("button", { name: /delete/i }));
    expect(onConfirm).toHaveBeenCalled();
    expect(screen.queryByText("confirm?")).not.toBeInTheDocument();

    // Add again and cancel
    await act(async () => {
      useToastStore.getState().addConfirmToast("confirm?", onConfirm, onCancel);
    });
    expect(await screen.findByText("confirm?")).toBeInTheDocument();
    // 3) 취소 클릭 -> onCancel 호출되고 사라짐
    await user.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalled();
    expect(screen.queryByText("confirm?")).not.toBeInTheDocument();
  });
});

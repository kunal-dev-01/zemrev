// ./lib/redux/reduxProvider.tsx

import PageLayout from "@/components/Layouts/PageLayout";
import { store } from "./store";
import { Provider } from "react-redux";
import { ReactNode } from "react";

interface ReduxProviderProps {
  children: ReactNode;
}

const ReduxProvider = ({ children }: ReduxProviderProps) => {
  return (
    <Provider store={store}>
      <PageLayout>{children}</PageLayout>
    </Provider>
  );
}

export default ReduxProvider;
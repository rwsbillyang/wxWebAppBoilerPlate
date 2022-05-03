
import { auxiliaryRoutes } from "@/pages/auxiliary/routes";

import { wxUserLoginRoutes } from "@/user/routes";

const routes = wxUserLoginRoutes
    //.concat(wxOaAdminRoutes)
    //.concat(newsRoutes)
    //.concat(afterSaleRoutes)
    //.concat(financeRoutes)

export default routes.concat(auxiliaryRoutes)





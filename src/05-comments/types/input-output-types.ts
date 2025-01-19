import {CommentatorInfo} from "./commentator-info-type";

type CommentInputModel = {
    content: string
};

type CommentViewModel = {
    id: string,
    content: string,
    commentatorInfo: CommentatorInfo,
    createdAt: string
};



export {
    CommentInputModel,
    CommentViewModel
};

// filterAndSort(
//     items: CommentViewModel[],
//     sortAndPaginationFilter: PaginationAndSortFilterType
// ) {
//     const {
//         pageNumber,
//         pageSize,
//         sortBy,
//         sortDirection,
//     } = sortAndPaginationFilter;
//
//     const startIndex = (pageNumber - 1) * pageSize;
//     const endIndex = startIndex + pageSize;
//
//     // Сопоставление свойств с путями
//     // const propertyMap: Record<string, string> = {
//     //     userLogin: 'commentatorInfo.userLogin',
//     //     userId: 'commentatorInfo.userId',
//     //     content: 'content',
//     //     createdAt: 'createdAt',
//     // };
//
//     // Получить путь из сопоставления
//     const path = propertyMap[sortBy];
//     if (!path) {
//         throw new Error(`Invalid sortBy property: ${sortBy}`);
//     }
//
//     // Функция для извлечения значения по пути
//     const getValueByPath = (obj: any, path: string): any => {
//         return path.split('.').reduce((acc, key) => acc && acc[key], obj);
//     };
//
//     return items
//         .sort((a: CommentViewModel, b: CommentViewModel) => {
//             const aValue = getValueByPath(a, path);
//             const bValue = getValueByPath(b, path);
//
//             if (sortDirection === SortDirection.Descending) {
//                 if (aValue < bValue) return 1;
//                 if (aValue > bValue) return -1;
//                 return 0;
//             }
//             if (sortDirection === SortDirection.Ascending) {
//                 if (aValue < bValue) return -1;
//                 if (aValue > bValue) return 1;
//                 return 0;
//             }
//
//             return 0;
//         })
//         .slice(startIndex, endIndex);
// }

#include <iostream>
using namespace std;

#define ROWS 2
#define COLS 3
#define COLS_B 2

void matrixMultiply(int A[ROWS][COLS], int B[COLS][COLS_B], int C[ROWS][COLS_B]) {
    // 初始化結果矩陣 C
    for (int i = 0; i < ROWS; i++) {
        for (int j = 0; j < COLS_B; j++) {
            C[i][j] = 0;  // 先清零
            // 執行矩陣相乘
            for (int k = 0; k < COLS; k++) {
                C[i][j] += A[i][k] * B[k][j];
            }
        }
    }
}

void printMatrix(int matrix[ROWS][COLS_B]) {
    for (int i = 0; i < ROWS; i++) {
        for (int j = 0; j < COLS_B; j++) {
            cout << matrix[i][j] << " ";
        }
        cout << endl;
    }
}

int main() {
    // 定義兩個靜態矩陣
    int A[ROWS][COLS] = {
        {1, 2, 3},
        {4, 5, 6}
    };

    int B[COLS][COLS_B] = {
        {7, 8},
        {9, 10},
        {11, 12}
    };

    int C[ROWS][COLS_B];  // 儲存結果的矩陣

    // 執行矩陣相乘
    matrixMultiply(A, B, C);

    // 輸出結果
    cout << "結果矩陣 C:" << endl;
    printMatrix(C);

    return 0;
}
